import { Problem } from './exercises';

export interface NationalTest {
  id: string;
  year: string;
  session: 'iunie' | 'august' | 'simulare';
  problems: Problem[];
}

export const nationalTests: NationalTest[] = [
  {
    id: 'en-2023-iunie',
    year: '2023',
    session: 'iunie',
    problems: [
      {
        id: 'en23-1',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_reale',
        source: 'EN 2023',
        problem: 'Rezultatul calculului $10 - 10 : 10$ este egal cu:',
        solution: '$10 - 10 : 10 = 10 - 1 = 9$.',
        answer: '9',
        difficulty: 1,
        hint: 'Respectă ordinea operațiilor: împărțirea înainte de scădere.',
        similarExampleSolution: 'Calculați $20 - 20 : 2$. Rezolvare: $20 - 10 = 10$.'
      },
      {
        id: 'en23-2',
        domeniu: 'Rapoarte și proporții',
        categorie: 'rapoarte',
        source: 'EN 2023',
        problem: 'Dacă $\\frac{a}{4} = \\frac{5}{2}$, atunci valoarea numărului $a$ este egală cu:',
        solution: '$2a = 4 \\cdot 5 \\Rightarrow 2a = 20 \\Rightarrow a = 10$.',
        answer: '10',
        difficulty: 1,
        hint: 'Produsul extremilor este egal cu produsul mijlociilor.',
        similarExampleSolution: 'Dacă $\\frac{x}{3} = \\frac{4}{2}$, atunci $2x = 12$, deci $x = 6$.'
      },
      {
        id: 'en23-3',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_reale',
        source: 'EN 2023',
        problem: 'Cel mai mare număr natural din intervalul $(2, 6]$ este:',
        solution: 'Intervalul conține numerele $3, 4, 5, 6$. Cel mai mare este $6$.',
        answer: '6',
        difficulty: 1,
        hint: 'Verifică dacă capetele intervalului sunt incluse.',
        similarExampleSolution: 'Cel mai mare număr natural din intervalul $[1, 5)$ este $4$.'
      },
      {
        id: 'en23-4',
        domeniu: 'Geometrie',
        categorie: 'patrulatere',
        source: 'EN 2023',
        problem: 'Perimetrul unui pătrat cu latura de $12$ cm este:',
        solution: '$P = 4 \\times 12 = 48$ cm',
        answer: '48',
        difficulty: 1,
        hint: '$P = 4l$.',
        similarExampleSolution: 'Pătrat cu $l=5 \\Rightarrow P=20$.'
      },
      {
        id: 'en23-5',
        domeniu: 'Geometrie',
        categorie: 'poliedre',
        source: 'EN 2023',
        problem: 'Volumul unui cub cu muchia de $3$ cm este:',
        solution: '$V = 3^3 = 27$ cm$^3$',
        answer: '27',
        difficulty: 1,
        hint: '$V = l^3$.',
        similarExampleSolution: 'Cub cu $l=2 \\Rightarrow V=8$.'
      },
      {
        id: 'en23-6',
        domeniu: 'Ecuații, inecuații, sisteme',
        categorie: 'ecuatii',
        source: 'EN 2023',
        problem: 'Soluția ecuației $2x - 4 = 10$ este:',
        solution: '$2x = 14 \\Rightarrow x = 7$',
        answer: '7',
        difficulty: 2,
        hint: 'Mută termenul liber cu semn schimbat.',
        similarExampleSolution: '$3x + 1 = 10 \\Rightarrow 3x = 9 \\Rightarrow x = 3$.'
      },
      {
        id: 'en23-7',
        domeniu: 'Funcții',
        categorie: 'functii',
        source: 'EN 2023',
        problem: 'Fie $f(x) = x + 2$. Valoarea $f(3)$ este:',
        solution: '$f(3) = 3 + 2 = 5$',
        answer: '5',
        difficulty: 1,
        hint: 'Înlocuiește $x$ cu $3$.',
        similarExampleSolution: '$f(x) = 2x \\Rightarrow f(4) = 8$.'
      },
      {
        id: 'en23-8',
        domeniu: 'Calcul algebric',
        categorie: 'calcul_algebric',
        source: 'EN 2023',
        problem: 'Calculați $(x+2)^2 - x^2$.',
        solution: '$x^2 + 4x + 4 - x^2 = 4x + 4$',
        answer: '4x + 4',
        difficulty: 2,
        hint: 'Folosește formula $(a+b)^2$.',
        similarExampleSolution: '$(x+1)^2 - x^2 = 2x + 1$.'
      },
      {
        id: 'en23-9',
        domeniu: 'Geometrie',
        categorie: 'arii',
        source: 'EN 2023',
        problem: 'Aria unui dreptunghi cu $L=10$ și $l=5$ este:',
        solution: '$A = 10 \\times 5 = 50$',
        answer: '50',
        difficulty: 1,
        hint: '$A = L \\times l$.',
        similarExampleSolution: 'Dreptunghi cu $L=6, l=4 \\Rightarrow A=24$.'
      },
      {
        id: 'en23-10',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_reale',
        source: 'EN 2023',
        problem: 'Media aritmetică a numerelor $12$ și $18$ este:',
        solution: '$(12 + 18) / 2 = 15$',
        answer: '15',
        difficulty: 1,
        hint: 'Suma numerelor împărțită la 2.',
        similarExampleSolution: 'Media lui $10$ și $20$ este $15$.'
      }
    ]
  },
  {
    id: 'en-2022-iunie',
    year: '2022',
    session: 'iunie',
    problems: [
      {
        id: 'en22-1',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_intregi',
        source: 'EN 2022',
        problem: 'Rezultatul calculului $5 + 5 \\times (10 - 8)$ este:',
        solution: '$5 + 5 \\times 2 = 5 + 10 = 15$',
        answer: '15',
        difficulty: 1,
        hint: 'Rezolvă paranteza întâi.',
        similarExampleSolution: '$3 + 3 \\times (5 - 2) = 3 + 3 \\times 3 = 12$.'
      },
      {
        id: 'en22-2',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_rationale',
        source: 'EN 2022',
        problem: 'Inversa fracției $\\frac{2}{3}$ este:',
        solution: '$\\frac{3}{2}$',
        answer: '3/2',
        difficulty: 1,
        hint: 'Inversa unei fracții $\\frac{a}{b}$ este $\\frac{b}{a}$.',
        similarExampleSolution: 'Inversa lui $\\frac{5}{4}$ este $\\frac{4}{5}$.'
      },
      {
        id: 'en22-3',
        domeniu: 'Rapoarte și proporții',
        categorie: 'rapoarte',
        source: 'EN 2022',
        problem: '$10\\%$ din $200$ este:',
        solution: '$0.1 \\times 200 = 20$',
        answer: '20',
        difficulty: 1,
        hint: '$\\frac{p}{100} \\times n$.',
        similarExampleSolution: '$20\\%$ din $50$ este $10$.'
      },
      {
        id: 'en22-4',
        domeniu: 'Geometrie',
        categorie: 'patrulatere',
        source: 'EN 2022',
        problem: 'Diagonala unui pătrat cu latura de $4$ cm este:',
        solution: '$d = l\\sqrt{2} = 4\\sqrt{2}$ cm',
        answer: '4\u221a2',
        difficulty: 2,
        hint: '$d = l\\sqrt{2}$.',
        similarExampleSolution: 'Latura $5 \\Rightarrow d=5\\sqrt{2}$.'
      },
      {
        id: 'en22-5',
        domeniu: 'Ecuații, inecuații, sisteme',
        categorie: 'ecuatii',
        source: 'EN 2022',
        problem: 'Soluția ecuației $\\frac{x}{2} = 5$ este:',
        solution: '$x = 10$',
        answer: '10',
        difficulty: 1,
        hint: 'Înmulțește cu numitorul.',
        similarExampleSolution: '$\\frac{x}{3} = 2 \\Rightarrow x = 6$.'
      },
      {
        id: 'en22-6',
        domeniu: 'Geometrie',
        categorie: 'poliedre',
        source: 'EN 2022',
        problem: 'Aria totală a unui cub cu latura de $2$ cm este:',
        solution: '$A_t = 6 \\times l^2 = 6 \\times 4 = 24$ cm$^2$',
        answer: '24',
        difficulty: 2,
        hint: '$A_t = 6l^2$.',
        similarExampleSolution: 'Cub cu $l=1 \\Rightarrow A_t=6$.'
      },
      {
        id: 'en22-7',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_reale',
        source: 'EN 2022',
        problem: 'Calculați $\\sqrt{144} - \\sqrt{81}$.',
        solution: '$12 - 9 = 3$',
        answer: '3',
        difficulty: 1,
        hint: 'Extrage radicalii.',
        similarExampleSolution: '$\\sqrt{25} - \\sqrt{16} = 5 - 4 = 1$.'
      },
      {
        id: 'en22-8',
        domeniu: 'Calcul algebric',
        categorie: 'calcul_algebric',
        source: 'EN 2022',
        problem: 'Descompuneți $x^2 - 9$.',
        solution: '$(x-3)(x+3)$',
        answer: '$(x-3)(x+3)$',
        difficulty: 2,
        hint: 'Diferența de pătrate.',
        similarExampleSolution: '$x^2 - 4 = (x-2)(x+2)$.'
      },
      {
        id: 'en22-9',
        domeniu: 'Geometrie',
        categorie: 'triunghi_dreptunghic',
        source: 'EN 2022',
        problem: 'Valoarea $\\sin(30^\\circ)$ este:',
        solution: '$\\frac{1}{2}$',
        answer: '1/2',
        difficulty: 1,
        hint: 'Valoare fundamentală.',
        similarExampleSolution: '$\\cos(60^\\circ) = \\frac{1}{2}$.'
      },
      {
        id: 'en22-10',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_naturale',
        source: 'EN 2022',
        problem: 'Intersecția mulțimilor $\\{1, 2, 3\\}$ și $\\{2, 3, 4\\}$ este:',
        solution: '$\\{2, 3\\}$',
        answer: '{2, 3}',
        difficulty: 1,
        hint: 'Elementele comune.',
        similarExampleSolution: '$\\{A, B\\} \\cap \\{B, C\\} = \\{B\\}$.'
      }
    ]
  },
  {
    id: 'en-2021-simulare',
    year: '2021',
    session: 'simulare',
    problems: [
      {
        id: 'sim21-1',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_naturale',
        source: 'Simulare 2021',
        problem: 'Mulțimea $A = \\{x \\in \\mathbb{N} \\mid x < 3\\}$ este:',
        solution: '$A = \\{0, 1, 2\\}$',
        answer: '{0, 1, 2}',
        difficulty: 1,
        hint: 'Numerele naturale încep de la 0.',
        similarExampleSolution: '$x \\in \\mathbb{N}, x < 2 \\Rightarrow \\{0, 1\\}$.'
      },
      {
        id: 'sim21-2',
        domeniu: 'Geometrie',
        categorie: 'arii',
        source: 'Simulare 2021',
        problem: 'Aria unui pătrat cu latura de $5$ cm este:',
        solution: '$A = 5^2 = 25$ cm$^2$',
        answer: '25',
        difficulty: 1,
        hint: 'Aria pătratului este $l^2$.',
        similarExampleSolution: 'Pătrat cu $l=4 \\Rightarrow A=16$.'
      },
      {
        id: 'sim21-3',
        domeniu: 'Ecuații, inecuații, sisteme',
        categorie: 'ecuatii',
        source: 'Simulare 2021',
        problem: 'Soluția ecuației $3x = 12$ este:',
        solution: '$x = 4$',
        answer: '4',
        difficulty: 1,
        hint: 'Împarte la coeficientul lui $x$.',
        similarExampleSolution: '$2x = 10 \\Rightarrow x = 5$.'
      },
      {
        id: 'sim21-4',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_intregi',
        source: 'Simulare 2021',
        problem: 'Modulul numărului $-7$ este:',
        solution: '$|-7| = 7$',
        answer: '7',
        difficulty: 1,
        hint: 'Modulul este distanța până la zero (mereu pozitiv).',
        similarExampleSolution: '$|-5| = 5$.'
      },
      {
        id: 'sim21-5',
        domeniu: 'Geometrie',
        categorie: 'triunghiuri_congruente',
        source: 'Simulare 2021',
        problem: 'Suma unghiurilor unui triunghi este:',
        solution: '$180^\\circ$',
        answer: '180',
        difficulty: 1,
        hint: 'Proprietate fundamentală a triunghiului.',
        similarExampleSolution: 'Suma unghiurilor unui patrulater este $360^\\circ$.'
      },
      {
        id: 'sim21-6',
        domeniu: 'Rapoarte și proporții',
        categorie: 'rapoarte',
        source: 'Simulare 2021',
        problem: 'Dacă $25\\%$ dintr-un număr este $10$, numărul este:',
        solution: '$0.25x = 10 \\Rightarrow x = 40$',
        answer: '40',
        difficulty: 2,
        hint: '$25\\%$ înseamnă un sfert.',
        similarExampleSolution: '$50\\%$ dintr-un număr e $20 \\Rightarrow numărul e $40$.'
      },
      {
        id: 'sim21-7',
        domeniu: 'Calcul algebric',
        categorie: 'calcul_algebric',
        source: 'Simulare 2021',
        problem: 'Calculați $(x-3)^2$.',
        solution: '$x^2 - 6x + 9$',
        answer: 'x^2 - 6x + 9',
        difficulty: 1,
        hint: '$(a-b)^2 = a^2 - 2ab + b^2$.',
        similarExampleSolution: '$(x-2)^2 = x^2 - 4x + 4$.'
      },
      {
        id: 'sim21-8',
        domeniu: 'Geometrie',
        categorie: 'poliedre',
        source: 'Simulare 2021',
        problem: 'Numărul de muchii ale unui cub este:',
        solution: '$12$',
        answer: '12',
        difficulty: 1,
        hint: 'Numără muchiile bazei și cele laterale.',
        similarExampleSolution: 'Numărul de vârfuri ale unui cub este $8$.'
      },
      {
        id: 'sim21-9',
        domeniu: 'Mulțimi numerice',
        categorie: 'numere_reale',
        source: 'Simulare 2021',
        problem: 'Partea întreagă a numărului $3.7$ este:',
        solution: '$[3.7] = 3$',
        answer: '3',
        difficulty: 1,
        hint: 'Cel mai mare întreg mai mic sau egal cu numărul.',
        similarExampleSolution: '$[4.2] = 4$.'
      },
      {
        id: 'sim21-10',
        domeniu: 'Geometrie',
        categorie: 'triunghi_dreptunghic',
        source: 'Simulare 2021',
        problem: 'Lungimea ipotenuzei unui triunghi dreptunghic cu catetele $3$ și $4$ este:',
        solution: '$c^2 = 3^2 + 4^2 = 25 \\Rightarrow c = 5$',
        answer: '5',
        difficulty: 2,
        hint: 'Teorema lui Pitagora.',
        similarExampleSolution: 'Catete $6$ și $8 \\Rightarrow$ ipotenuza $10$.'
      }
    ]
  }
];

