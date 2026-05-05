export interface Problem {
  id: string;
  topicId: string;
  title: string;
  statement: string;
  hint: string;
  solution: string;
  answer: string;
  difficulty: 'ușor' | 'mediu' | 'dificil';
  similarExample?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  problems: Problem[];
}

export const curriculum: Topic[] = [
  {
    id: 'numere-reale',
    title: 'Numere reale și Radicali',
    description: 'Operații cu numere reale, scoaterea și introducerea factorilor de sub radical.',
    problems: [
      {
        id: 'p1',
        topicId: 'numere-reale',
        title: 'Calcul cu radicali',
        statement: 'Calculați valoarea expresiei: $\\sqrt{12} + \\sqrt{27} - \\sqrt{48}$.',
        hint: 'Descompuneți numerele de sub radical în factori primi pentru a scoate factorii de sub radical.',
        solution: '$\\sqrt{12} = 2\\sqrt{3}$, $\\sqrt{27} = 3\\sqrt{3}$, $\\sqrt{48} = 4\\sqrt{3}$. Atunci: $2\\sqrt{3} + 3\\sqrt{3} - 4\\sqrt{3} = (2+3-4)\\sqrt{3} = 1\\sqrt{3} = \\sqrt{3}$.',
        answer: 'sqrt(3)',
        difficulty: 'ușor',
        similarExample: 'Calculați $\\sqrt{8} + \\sqrt{18} - \\sqrt{32}$. \n\n**Rezolvare:** $\\sqrt{8}=2\\sqrt{2}$, $\\sqrt{18}=3\\sqrt{2}$, $\\sqrt{32}=4\\sqrt{2}$. Rezultat: $2\\sqrt{2}+3\\sqrt{2}-4\\sqrt{2} = \\sqrt{2}$.'
      },
      {
        id: 'p6',
        topicId: 'numere-reale',
        title: 'Scoaterea factorilor',
        statement: 'Scoateți factorii de sub radical pentru $\\sqrt{72}$.',
        hint: 'Căutați cel mai mare pătrat perfect care îl divide pe 72.',
        solution: '$\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$.',
        answer: '6sqrt(2)',
        difficulty: 'ușor',
        similarExample: 'Scoateți factorii pentru $\\sqrt{50}$. \n\n**Rezolvare:** $\\sqrt{50} = \\sqrt{25 \\cdot 2} = 5\\sqrt{2}$.'
      }
    ]
  },
  {
    id: 'ecuatii',
    title: 'Ecuații și inecuații',
    description: 'Ecuații de gradul I și II, sisteme de ecuații.',
    problems: [
      {
        id: 'p2',
        topicId: 'ecuatii',
        title: 'Ecuație de gradul II',
        statement: 'Rezolvați în $\\mathbb{R}$ ecuația: $x^2 - 5x + 6 = 0$.',
        hint: 'Folosiți formula discriminantului $\\Delta = b^2 - 4ac$ sau descompunerea în factori.',
        solution: '$\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1$. Rădăcinile sunt $x_{1,2} = \\frac{5 \\pm \\sqrt{1}}{2}$, deci $x_1 = 3$ și $x_2 = 2$.',
        answer: '2, 3',
        difficulty: 'mediu',
        similarExample: 'Rezolvați $x^2 - 7x + 12 = 0$. \n\n**Rezolvare:** $\\Delta = 49 - 48 = 1$. $x = (7 \\pm 1)/2 \\Rightarrow x_1=4, x_2=3$.'
      },
      {
        id: 'p7',
        topicId: 'ecuatii',
        title: 'Sistem de ecuații',
        statement: 'Rezolvați sistemul: $\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$',
        hint: 'Adunați cele două ecuații pentru a elimina variabila $y$.',
        solution: 'Adunând ecuațiile: $(x+y) + (x-y) = 5+1 \\Rightarrow 2x = 6 \\Rightarrow x = 3$. Înlocuind $x=3$ în prima ecuație: $3+y=5 \\Rightarrow y=2$.',
        answer: 'x=3, y=2',
        difficulty: 'ușor',
        similarExample: 'Rezolvați $\\begin{cases} x + y = 10 \\\\ x - y = 4 \\end{cases}$. \n\n**Rezolvare:** $2x=14 \\Rightarrow x=7$. $7+y=10 \\Rightarrow y=3$.'
      }
    ]
  },
  {
    id: 'geometrie-plana',
    title: 'Geometrie plană',
    description: 'Triunghiuri, patrulatere, cercul. Arii și perimetre.',
    problems: [
      {
        id: 'p3',
        topicId: 'geometrie-plana',
        title: 'Aria triunghiului',
        statement: 'Aflați aria unui triunghi dreptunghic cu catetele de 6 cm și 8 cm.',
        hint: 'Aria triunghiului dreptunghic este jumătate din produsul catetelor.',
        solution: '$A = \\frac{c_1 \\cdot c_2}{2} = \\frac{6 \\cdot 8}{2} = 24$ cm$^2$.',
        answer: '24',
        difficulty: 'ușor'
      },
      {
        id: 'p4',
        topicId: 'geometrie-plana',
        title: 'Perimetrul pătratului',
        statement: 'Dacă aria unui pătrat este de 49 cm$^2$, aflați perimetrul acestuia.',
        hint: 'Aria pătratului este $l^2$. Aflați latura $l$ mai întâi.',
        solution: '$l^2 = 49 \\Rightarrow l = \\sqrt{49} = 7$ cm. Perimetrul $P = 4l = 4 \\cdot 7 = 28$ cm.',
        answer: '28',
        difficulty: 'ușor'
      }
    ]
  },
  {
    id: 'geometrie-spatiu',
    title: 'Geometrie în spațiu',
    description: 'Prisme, piramide, cilindri. Arii și volume.',
    problems: [
      {
        id: 'p5',
        topicId: 'geometrie-spatiu',
        title: 'Volumul cubului',
        statement: 'Calculați volumul unui cub cu latura de 5 cm.',
        hint: 'Volumul cubului este $V = l^3$.',
        solution: '$V = 5^3 = 5 \\cdot 5 \\cdot 5 = 125$ cm$^3$.',
        answer: '125',
        difficulty: 'ușor'
      }
    ]
  }
];
