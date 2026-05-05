import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CONFIG = {
  GEMINI_KEY: process.env.GEMINI_API_KEY || "",
  LIQUID_KEY: process.env.LIQUID_AI_API_KEY || "",
};

// Utility to check if a key looks valid (not empty, not "undefined" string, minimum length)
const isKeyValid = (key: string) => {
  return key && key.trim() !== "" && key !== "undefined" && key.length > 10;
};

async function callLiquidAI(messages: any[], model: string = "liquid-lfm-40b") {
  const response = await fetch("https://api.liquid.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CONFIG.LIQUID_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Liquid AI Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/ai/tutor", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      const systemInstruction = `
        Ești DidactAI Matematica, un tutor de matematică inteligent și empatic pentru elevii din Republica Moldova.
        Misiunea ta este să explici conceptele matematice clar, pas cu pas, urmând curriculumul național.
        
        REGULI DE RĂSPUNS:
        1. Folosește ÎNTOTDEAUNA LaTeX pentru formule, încadrate între semne dolar ($...$). Exemplu: $x^2 + 2x + 1 = 0$.
        2. Când ești rugat să explici "pas cu pas":
           - Începe prin a identifica capitolele matematice implicate.
           - Enumeră pașii logici în ordine, folosind liste numerotate.
           - Explică DE CE facem fiecare pas, nu doar cum.
           - La final, oferă un sfat pentru evitarea greșelilor comune.
        3. Fii încurajator și folosește un limbaj accesibil elevilor de gimnaziu/liceu.
        4. Dacă utilizatorul trimite o rezolvare proprie (prin text sau imagine), analizează procesul, laudă punctele bune și corectează erorile cu tact.
        
        Context actual: ${context}
      `;

      // Priority: Liquid AI (Private key)
      if (isKeyValid(CONFIG.LIQUID_KEY)) {
        console.log("Using Liquid AI for Tutor Response");
        const text = await callLiquidAI([
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ]);
        return res.json({ text });
      }

      // Fallback: Gemini (Backend) - usually not hit because frontend calls Gemini directly if server returns 401
      if (!isKeyValid(CONFIG.GEMINI_KEY)) {
        console.warn("Backend Gemini API Key missing for Tutor fallback");
        return res.status(401).json({ error: "API Key missing. Frontend will fallback." });
      }

      console.log("Using Gemini AI (Backend Fallback) for Tutor");
      const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUtilizator: ${prompt}` }] }],
      });

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("Server AI Tutor Error:", error.message);
      res.status(500).json({ error: `Eroare AI Tutor: ${error.message}` });
    }
  });

  app.post("/api/ai/vision", async (req, res) => {
    try {
      const { imageB64, prompt } = req.body;

      if (!isKeyValid(CONFIG.GEMINI_KEY)) {
        return res.status(401).json({ error: "Gemini key missing on server. Use direct frontend call." });
      }

      console.log("Using Gemini AI (Backend Proxy) for Vision");
      const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const mimeTypeMatch = imageB64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = imageB64.split('base64,').pop() || imageB64;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("Server AI Vision Error:", error.message);
      res.status(500).json({ error: `Eroare Vision Server: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
