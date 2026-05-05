import { exercises } from '../../data/exercises';

/**
 * SERVICIUL ML 2: DATE NESTRUCTURATE (TEXT)
 * Scop: Înțelegerea intenției elevului și extragerea semantică a informațiilor relevante.
 */

export class UnstructuredMLService {
  private static mathKnowledge: Record<string, { definition: string, example: string }> = {
    "pitagora": {
      definition: "Teorema lui Pitagora: Într-un triunghi dreptunghic (unghi 90°), suma pătratelor catetelor este egală cu pătratul ipotenuzei: $c_1^2 + c_2^2 = ip^2$.",
      example: "Exemplu: Dacă catetele sunt 3 și 4, ipotenuza este $\\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = 5$."
    },
    "expresii": {
      definition: "Formule de calcul prescurtat:\n1. $(a+b)^2 = a^2 + 2ab + b^2$\n2. $(a-b)^2 = a^2 - 2ab + b^2$\n3. $(a-b)(a+b) = a^2 - b^2$",
      example: "Exemplu: $(x+3)^2 = x^2 + 6x + 9$."
    },
    "ecuati": {
      definition: "Ecuații:\n- **Grad I:** $ax + b = 0 \\Rightarrow x = -b/a$.\n- **Grad II:** $ax^2 + bx + c = 0$. $\\Delta = b^2 - 4ac$. Dacă $\\Delta > 0, x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.\n- **Sisteme:** Metoda substituției sau a reducerii pentru a afla $(x, y)$.",
      example: "Exemplu: $x^2 - 5x + 6 = 0 \\Rightarrow \\Delta = 1, x_1 = 3, x_2 = 2$."
    },
    "radical": {
      definition: "Radicali:\n1. $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$\n2. $\\sqrt{a} / \\sqrt{b} = \\sqrt{a/b}$\n3. $\\sqrt{a^2} = |a|$\n4. Introducere sub radical: $x\\sqrt{a} = \\sqrt{x^2a}$.",
      example: "Exemplu: $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$."
    },
    "inecuati": {
      definition: "Inecații:\n- Se rezolvă ca o ecuație, DAR la înmulțirea/împărțirea cu număr negativ, semnul se schimbă! (ex: $-x < 3 \\Rightarrow x > -3$).\n- Rezultatul este un interval (ex: $x \\in (3, +\\infty)$).",
      example: "Exemplu: $2x - 4 \\geq 6 \\Rightarrow 2x \\geq 10 \\Rightarrow x \\geq 5 \\Rightarrow x \\in [5, +\\infty)$."
    },
    "functie": {
      definition: "Funcții (grad I): $f(x) = ax + b$.\n- $f(x)=0 \\Rightarrow$ intersecția cu OX.\n- $f(0) \\Rightarrow$ intersecția cu OY.\n- Graficul este o dreaptă.",
      example: "Exemplu: $f(x) = 2x - 4. OX: 2x-4=0 \\Rightarrow x=2. A(2,0)$."
    },
    "geometrie": {
      definition: "Geometrie Plană:\n- **Aria triunghi:** $(b \\cdot h)/2$.\n- **Pătrat:** $A=l^2, d=l\\sqrt{2}$.\n- **Cerc:** $A=\\pi r^2, L=2\\pi r$.",
      example: "Exemplu: Raza 5 $\\Rightarrow A=25\\pi, L=10\\pi$."
    },
    "procente": {
      definition: "Procente:\n- $p\\%$ din $x = (p/100) \\cdot x$.\n- Scumpire: $x + (p/100)x$.\n- Ieftinire: $x - (p/100)x$.",
      example: "Exemplu: 20% din 150 = 30."
    },
    "puteri": {
      definition: "Puteri: $a^n \\cdot a^m = a^{n+m}, a^n / a^m = a^{n-m}, (a^n)^m = a^{nm}, a^0=1$.",
      example: "Exemplu: $2^3 \\cdot 2^2 = 2^5 = 32$."
    },
    "volum": {
      definition: "Volumul (3D): Cub ($l^3$), Prisma ($A_b \\cdot h$), Piramida ($A_b \\cdot h / 3$), Cilindru ($\\pi r^2 h$).",
      example: "Exemplu: Cub cu latura 2 are $V = 2^3 = 8$."
    },
    "probabilit": {
      definition: "Probabilitatea: $P = \\frac{\\text{nr. cazuri favorabile}}{\\text{nr. cazuri posibile}}$. Valoarea este între 0 și 1.",
      example: "Exemplu: Într-o urnă cu 3 bile albe și 2 roșii, probabilitatea să scoți o bilă albă este $3/5$."
    },
    "modul": {
      definition: "Modulul (Valoarea absolută) $|x|$:\n- Este distanța de la $x$ la origine pe axa numerelor.\n- $|ax + b| = c \\Rightarrow ax + b = c$ sau $ax + b = -c$ (pentru $c \\ge 0$).",
      example: "Exemplu: $|x - 3| = 5 \\Rightarrow x-3=5$ ($x=8$) sau $x-3=-5$ ($x=-2$)."
    }
  };

  private static stopWords = new Set(["ce", "este", "cum", "se", "un", "o", "la", "de", "pe", "si", "cu", "din", "nu", "da"]);

  static processText(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\săâîșț]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token))
      .map(token => {
        if (token.endsWith('ul')) return token.slice(0, -2);
        if (token.endsWith('lor')) return token.slice(0, -3);
        if (token.endsWith('le')) return token.slice(0, -2);
        if (token.endsWith('ă')) return token.slice(0, -1) + 'a';
        if (token.endsWith('ămi')) return token.slice(0, -3);
        return token;
      });
  }

  private static lastTopic: string | null = null;

  static generateTutorHelp(message: string, currentExerciseId?: string): string {
    const tokens = this.processText(message);
    const text = message.toLowerCase();
    const exercise = currentExerciseId ? exercises.find(e => e.id === currentExerciseId) : null;

    const isAskingForHint = tokens.some(t => ["ajutor", "hint", "indicatie", "pas", "incep", "ide", "indiciu"].includes(t));
    const isAskingForSolution = tokens.some(t => ["solutie", "rezultat", "raspuns", "gata", "final", "explica", "rezolva", "cum"].includes(t)) || text.includes("pas cu pas") || text.includes("cum se face");
    const isAskingForTheory = tokens.some(t => ["teorie", "definitie", "lectie", "invata", "regula", "formula"].includes(t));
    const isAskingForExample = tokens.some(t => ["exemplu", "concret", "arata", "demonst"].includes(t));
    
    if (isAskingForHint && exercise) {
      if (exercise.hints && exercise.hints.length > 0) {
        return `### 💡 Indiciu #1:\n${exercise.hints[0]}\n\n**Sfat:** ${exercise.hints[1] || "Gândește-te la formula de bază."}\n\nAi reușit să faci primul pas? Dacă vrei să-ți explic metoda completă, scrie mai jos cuvântul **explica**.`;
      }
      return `### 💡 Indiciu:\nPentru această problemă de **${exercise.domeniu}**, te sfătuiesc să identifici datele cunoscute și să aplici formula specifică. \n\nDacă ai nevoie de mai mult ajutor, scrie **explica** în chat.`;
    }

    if ((isAskingForSolution || text.includes("explica") || text.includes("rezolva")) && exercise) {
      const category = exercise.domeniu.toLowerCase();
      let theoryFound = "";
      let topicKey = "";

      try {
        for (const key of Object.keys(UnstructuredMLService.mathKnowledge)) {
          if (category.includes(key) || key.includes(category)) {
            theoryFound = UnstructuredMLService.mathKnowledge[key].definition;
            topicKey = key;
            break;
          }
        }
      } catch (e) {
        console.error("Error matching theory:", e);
      }
      
      const mainHint = (exercise.hints && exercise.hints.length > 0) ? exercise.hints[0] : "Identifică datele problemei și aplică formulele corespunzătoare.";
      
      return `### 🧠 Explicație Pas cu Pas (DidactAI)

Bună! Hai să analizăm acest exercițiu de **${exercise.domeniu}**. Pentru a-l rezolva corect, avem nevoie de următoarele baze teoretice:

#### 📚 Teorie și Formule:
${theoryFound || "Conceptele fundamentale ale acestui capitol care includ identificarea necunoscutelor și aplicarea operațiilor matematice de bază."}

#### 📝 Pașii de rezolvare:
1. **Analiza Enunțului:** Identificăm că avem de-a face cu ${exercise.domeniu}. Din textul problemei știm că: *${exercise.problem.substring(0, 50)}...*
2. **Identificarea Metodei:** Vom folosi următoarea logică: ${mainHint}
3. **Calculul Propriu-zis:** 
   - Începem prin a scrie formula adaptată datelor noastre.
   - Efectuăm operațiile în ordinea priorității (paranteze, ridicări la putere, înmulțiri, apoi adunări).
   - Verificăm dacă rezultatul are sens în contextul dat (ex: distanța nu poate fi negativă).

#### 💡 Sfat util:
${exercise.hints?.[1] || "Verifică întotdeauna calculele de două ori pentru a evita greșelile de neatenție la semne!"}

---
*Vrei să rezolvăm împreună un **exemplu** similar pentru a exersa?*`;
    }

    const isAffirmative = tokens.some(t => ["da", "rog", "sigur", "vrea", "poti", "multum", "ok"].includes(t));

    let currentTopic = "";
    for (const key of Object.keys(UnstructuredMLService.mathKnowledge)) {
      if (text.includes(key)) {
        currentTopic = key;
        UnstructuredMLService.lastTopic = key;
        break;
      }
    }

    if (!currentTopic && exercise) {
      const category = exercise.domeniu.toLowerCase();
      for (const key of Object.keys(UnstructuredMLService.mathKnowledge)) {
        if (category.includes(key)) {
          UnstructuredMLService.lastTopic = key;
          break;
        }
      }
    }

    if (isAffirmative && !currentTopic && UnstructuredMLService.lastTopic && UnstructuredMLService.mathKnowledge[UnstructuredMLService.lastTopic]) {
      return `Perfect! Iată un exemplu rezolvat pentru **${UnstructuredMLService.lastTopic}**: ${UnstructuredMLService.mathKnowledge[UnstructuredMLService.lastTopic].example}`;
    }

    if (isAskingForTheory) {
      const topicToUse = currentTopic || UnstructuredMLService.lastTopic;
      if (topicToUse && UnstructuredMLService.mathKnowledge[topicToUse]) {
        return `### 📚 Teoria pentru **${topicToUse}**:\n${UnstructuredMLService.mathKnowledge[topicToUse].definition}\n\nTe-ar ajuta și un exemplu rezolvat?`;
      }
    }

    if (isAskingForExample) {
      const topicToUse = currentTopic || UnstructuredMLService.lastTopic;
      if (topicToUse && UnstructuredMLService.mathKnowledge[topicToUse]) {
        return `Iată un exemplu pentru **${topicToUse}**: ${UnstructuredMLService.mathKnowledge[topicToUse].example}`;
      }
      return "Pentru ce anume dorești un exemplu? Pot să-ți explic Puteri, Radicali, Pitagora, Ecuații sau Volume.";
    }

    if (currentTopic && UnstructuredMLService.mathKnowledge[currentTopic]) {
      return `Vrei să recapitulăm teoria pentru **${currentTopic}** sau ai nevoie de un exemplu concret? \n\nIată pe scurt: ${UnstructuredMLService.mathKnowledge[currentTopic].definition}`;
    }

    if (exercise) {
      return `Salut! Sunt pregătit să te ajut cu această problemă de **${exercise.domeniu}**.

Iată ce pot face pentru tine:
- Scrie **'ajutor'** pentru un indiciu care să te pornească.
- Scrie **'explica'** pentru a vedea rezolvarea detaliată pas cu pas.
- Scrie **'teorie'** dacă vrei să recapitulăm regulile acestui capitol.

Cum vrei să începem?`;
    }

    return "Bună! Sunt asistentul local DidactAI. Te pot ajuta cu indicii și rezolvări pentru exercițiile de pe ecran sau pot explica concepte matematice. Ce te interesează?";
  }

  static getPipelineInfo() {
    return {
      name: "Local Semantic NLP Pipeline",
      stages: ["Tokenization", "Case Normalization", "Stop-word Removal", "Rule-based Stemming"],
      intentClasses: ["HintRequest", "SolutionRequest", "Confusion", "TopicQuery"],
      localExecution: true,
      requiresApiKey: false
    };
  }
}
