import { GoogleGenAI } from "@google/genai";
import { UnstructuredMLService } from "./ml/unstructured";

// Initialize Gemini directly in the frontend as per system instructions
// The platform injects GEMINI_API_KEY automatically
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || ""
});

export interface AnalysisResult {
  isCorrect: boolean | null;
  feedback: string;
  score: number;
  extractedResult?: string;
  isSimulated?: boolean;
}

// Configuration for AI Providers
const CONFIG = {
  // We prefer using the server-side proxy to protect the key
  HAS_SERVER_SIDE: true,
};

/**
 * Generic function to call AI for tutor responses
 */
export const getTutorResponse = async (prompt: string, context: string, currentExerciseId?: string) => {
  try {
    // 1. Try server proxy (it might use Liquid AI or other private keys)
    const response = await fetch("/api/ai/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.text;
    }

    // 2. Fallback: Call Gemini directly from frontend if server fails or is unauthorized
    console.log("Server proxy tutor failed, using direct Gemini frontend response.");
    
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

    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUtilizator: ${prompt}` }] }],
    });

    return result.text;
  } catch (error: any) {
    console.warn("AI Error (falling back to local):", error);
    return UnstructuredMLService.generateTutorHelp(prompt, currentExerciseId);
  }
};

/**
 * Specifically for analyzing an image of a handwritten solution
 */
export const analyzeSolutionImage = async (imageB64: string, problem: string, solution: string): Promise<AnalysisResult> => {
  const promptString = `
    Ești un profesor de matematică expert. Analizează această imagine care conține o rezolvare SCRISĂ DE MÂNĂ.
    Problemă: ${problem}
    Soluție de referință: ${solution}
    
    SARCIUNI:
    1. Descifrează textul scris de mână (OCR specializat pe matematică).
    2. Compară pașii elevului cu soluția de referință.
    3. Dacă elevul a greșit, explică UNDE e greșeala fără să dai rezultatul final imediat.
    4. Dacă e corect, felicită-l.
    5. EXTRAGE REZULTATUL FINAL: Identifică valoarea finală pe care elevul a calculat-o (ex: "x=5" sau "120"). Dacă elevul a folosit notații precum "sqrt" sau "^" sau "delta", include-le în valoarea extrasă.
    
    IMPORTANT: Răspunde DOAR cu un obiect JSON VALID. Nu adăuga text înainte sau după.
    
    FORMAT RĂSPUNS (JSON):
    {
      "isCorrect": boolean,
      "feedback": "Mesaj în română cu LaTeX pentru pași și corectitudine",
      "extractedResult": "valoare_finală (ex: 60)"
    }
  `;

  try {
    console.log("Analyzing image directly from frontend using Gemini Flash...");
    
    const mimeTypeMatch = imageB64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Data = imageB64.split('base64,').pop() || imageB64;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: promptString },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text || "";
    if (!rawText) {
      throw new Error("AI-ul nu a returnat niciun text. Încearcă din nou.");
    }

    console.log("AI Vision Frontend Response:", rawText);

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Robust extraction if JSON is wrapped in commentary despite instructions
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.warn("Failed to parse JSON despite match:", e2);
        }
      }
    }

    if (parsed) {
      let cleanResult = parsed.extractedResult || "";
      if (cleanResult.includes('=')) {
        cleanResult = cleanResult.split('=').pop()?.trim() || cleanResult;
      }

      return {
        isCorrect: parsed.isCorrect,
        feedback: parsed.feedback || "Am analizat rezolvarea ta.",
        score: parsed.isCorrect ? 100 : 0,
        extractedResult: cleanResult
      };
    }
    
    // Fallback if no JSON found
    return { 
      isCorrect: rawText.toLowerCase().includes("corect") && !rawText.toLowerCase().includes("incorect"), 
      feedback: rawText.length > 1000 ? rawText.substring(0, 1000) + "..." : rawText,
      score: 0,
      extractedResult: rawText.match(/(?:rezultat|final|este)\s*[:=]\s*([a-zA-Z0-9.,]+)/i)?.[1]
    };
  } catch (error: any) {
    console.error("Direct Frontend Vision Error:", error);
    
    // Fallback to server proxy if frontend fails (maybe local development or custom keys)
    try {
      console.log("Attempting server-side vision proxy fallback...");
      const proxyResponse = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageB64, prompt: promptString })
      });
      
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        const proxyText = data.text;
        // Simplified parsing for proxy fallback
        const jsonMatch = proxyText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
           const parsed = JSON.parse(jsonMatch[0]);
           return {
             isCorrect: parsed.isCorrect,
             feedback: parsed.feedback,
             score: parsed.isCorrect ? 100 : 0,
             extractedResult: parsed.extractedResult
           };
        }
      }
    } catch (proxyError) {
      console.error("Proxy Vision Error:", proxyError);
    }

    return {
      isCorrect: null, 
      feedback: "Nu am putut analiza imaginea în acest moment. Te rugăm să verifici manual rezolvarea ta cu soluția oficială.",
      score: 0,
      isSimulated: true
    };
  }
};
