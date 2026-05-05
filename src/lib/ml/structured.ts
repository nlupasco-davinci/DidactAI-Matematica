import { exercises, Problem } from '../../data/exercises';

/**
 * SERVICIUL ML 1: DATE STRUCTURATE
 * Scop: Recomandarea inteligentă a exercițiilor bazată pe profilul de dificultate și performanță.
 */

export interface ExerciseFeatures {
  id: string;
  difficulty: number;
  categoryVector: number[];
  lengthFactor: number;
}

export class StructuredMLService {
  private static categories = [
    "numere_naturale", "numere_intregi", "numere_rationale", "numere_reale", 
    "rapoarte", "calcul_algebric", "functii", "ecuatii", "inecuatii", 
    "sisteme_ecuatii", "sisteme_inecuatii", "triunghiuri_congruente", 
    "triunghiuri_asemenea", "triunghi_dreptunghic", "patrulatere", "cerc", "arii", "poliedre", "corpuri_rotatie"
  ];

  /**
   * 3.2 Preprocesarea datelor structurate
   * - One-hot encoding pentru categorii
   * - Normalizarea dificultății
   * - Scaling pentru lungimea textului
   */
  static preprocess(problem: Problem): ExerciseFeatures {
    // One-hot encoding
    const categoryVector = this.categories.map(cat => cat === problem.categorie ? 1 : 0);
    
    // Scaling / Normalizarea dificultății (1-3 -> 0.33-1.0)
    const difficulty = problem.difficulty / 3;
    
    // Raportul lungimii textului (normalizat la 200 caractere)
    const lengthFactor = Math.min(problem.problem.length / 200, 1);

    return {
      id: problem.id,
      difficulty,
      categoryVector,
      lengthFactor
    };
  }

  /**
   * 3.4 Modelul de Recomandare (Local)
   * Folosește distanța euclidiană ponderată pentru a găsi exerciții similare 
   * dar cu dificultate progresivă.
   */
  static recommendNext(completedIds: string[], currentScore: number): Problem {
    const lastId = completedIds[completedIds.length - 1];
    const lastExercise = exercises.find(e => e.id === lastId) || exercises[0];
    const lastFeatures = this.preprocess(lastExercise);
    
    // Filtrăm ce am făcut deja
    const available = exercises.filter(e => !completedIds.includes(e.id));
    if (available.length === 0) return exercises[Math.floor(Math.random() * exercises.length)];

    // Target difficulty adjustment based on current performance
    const targetDifficulty = currentScore > 80 ? Math.min(lastFeatures.difficulty + 0.1, 1) : 
                           currentScore < 40 ? Math.max(lastFeatures.difficulty - 0.1, 0.33) : 
                           lastFeatures.difficulty;

    let bestMatch = available[0];
    let minDistance = Infinity;

    available.slice(0, 100).forEach(ex => {
      const feat = this.preprocess(ex);
      
      // Calculăm distanța (Euclidean distance)
      const diffDist = Math.pow(feat.difficulty - targetDifficulty, 2);
      const catDist = feat.categoryVector.reduce((acc, val, i) => 
        acc + Math.pow(val - lastFeatures.categoryVector[i], 2), 0) * 0.5; // pondere mai mică pentru categorie
        
      const distance = Math.sqrt(diffDist + catDist);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = ex;
      }
    });

    return bestMatch;
  }

  static getModelInfo() {
    return {
      name: "Weighted Multi-Feature Recommender",
      datasetSize: exercises.length,
      features: ["Difficulty (Normalized)", "Category (One-Hot)", "Text Complexity"],
      scaling: "Min-Max Scaling [0,1]",
      algorithm: "Modified k-Nearest Neighbors"
    };
  }
}
