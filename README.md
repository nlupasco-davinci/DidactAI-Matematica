# Conceptul aplicației – Didact

Didact este un sistem educațional adaptiv bazat pe inteligență artificială, conceput pentru a aborda diferențele individuale de învățare în predarea matematicii preuniversitare, în deplină aliniere cu curriculumul național.

---

## Problematica abordată

În sistemul educațional actual, elevii întâmpină dificultăți în învățarea matematicii din cauza:

- lipsei de suport personalizat  
- diferențelor de ritm și stil de învățare  
- resurselor digitale care oferă fie răspunsuri directe, fie explicații generale neadaptate sau în neconformitate cu programa școlară

Aceste limitări duc frecvent la memorare mecanică, blocaje conceptuale și o înțelegere superficială a materiei.

---

## Viziunea proiectului

Ne propunem dezvoltarea unui sistem inteligent care **nu oferă direct soluții**, ci ghidează elevul pas cu pas în procesul de rezolvare, adaptându-se continuu la nivelul, stilul și evoluția acestuia.

Didact tratează învățarea ca un proces activ, în care elevul:

- își construiește singur raționamentul  
- conștientizează propriile greșeli  
- își dezvoltă gândirea matematică, nu doar capacitatea de a obține un rezultat  

---

## Principii de bază

- Fiecare elev are un traseu personalizat de învățare  
- Sistemul se adaptează în timp real (dificultate, tip de explicații, ritm)  
- Indiciile sunt progresive și personalizate  
- Greșeala este tratată ca parte esențială a învățării  
- Nu se încurajează dependența de răspunsuri complete  

---

## Funcționalități propuse

- **Profil adaptiv al elevului**, construit pe baza unui test inițial și a comportamentului ulterior  
- **Clasificarea automată a problemelor** după temă, dificultate și competențe din curriculum  
- **Asistență ghidată în rezolvare**, prin indicii progresive și întrebări de conștientizare  
- **Detectarea tiparelor de erori** și intervenții țintite  
- **Spaced repetition adaptiv**, pentru consolidarea pe termen lung  
- **Evaluare multidimensională**, care ia în considerare procesul, nu doar rezultatul  

---

## Abordare educațională

Sistemul:

- ajustează dificultatea pentru a evita atât plictiseala, cât și anxietatea  
- oferă probleme din viața reală pentru a conecta abstractul cu concretul  
- încurajează transferul cunoștințelor între contexte diferite  

---

## Ce NU face sistemul

- nu oferă soluții complete din start  
- nu rezolvă problemele în locul elevului  
- nu tratează toți elevii la fel  
- nu optimizează doar pentru scoruri  

---

## Stadiul actual

Acesta este conceptul complet pe care ne propunem să îl dezvoltăm în timp.  

Versiunea actuală a proiectului reprezintă **un punct de pornire**, în care am început implementarea unor componente esențiale (ex: structurarea problemelor(conform programei pentru examenul de clasa 9, deoarece aici aveam la dispoziție mai multe date), mecanisme de bază pentru evaluare).


# DidactAI Matematica - Ghid de configurare 

Acest ghid te va ajuta să pui aplicația ta pe internet (GitHub și Hosting) pas cu pas, chiar dacă ești la început.

## 1. Ce trebuie să faci pe calculatorul tău (Local)

Înainte de a urca codul pe GitHub, asigură-te că ai totul pregătit:

1.  **Descarcă proiectul**: Salvează toate fișierele într-un folder pe calculatorul tău.
2.  **Fișierul .env**: Creează un fișier nou numit `.env` în folderul principal (lângă `package.json`).
3.  **Cheia API Gemini**:
    *   Mergi pe [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Creează o cheie API gratuită.
    *   În fișierul `.env`, scrie: `VITE_GEMINI_API_KEY=cheia_ta_aici`

## 2. Cum urci codul pe GitHub

GitHub este locul unde îți păstrezi codul online.

1.  Creează un cont pe [GitHub.com](https://github.com/).
2.  Instalează [GitHub Desktop](https://desktop.github.com/) (este cea mai simplă metodă pentru începători).
3.  În GitHub Desktop: `File -> Add Local Repository` -> Selectează folderul proiectului.
4.  Apasă pe **Publish Repository** pentru a-l urca online.

## 3. Cum pui site-ul pe Internet (Hosting)

Cea mai simplă metodă pentru aplicații React (cum este aceasta) este **Vercel** sau **Netlify**.

### Varianta recomandată: Vercel (Gratuit și Rapid)
1.  Creează un cont pe [Vercel.com](https://vercel.com/) folosind contul de GitHub.
2.  Apasă pe **Add New -> Project**.
3.  Selectează repozitoriul tău de GitHub.
4.  **IMPORTANT (Environment Variables)**: Înainte de a apăsa "Deploy", caută secțiunea "Environment Variables" și adaugă:
    *   `VITE_GEMINI_API_KEY` = (cheia ta de la pasul 1)
5.  Apasă **Deploy**. Gata! Site-ul tău este live.

## 4. Baza de Date (Firebase)

Aplicația este deja configurată să folosească Firebase.
*   Dacă vrei să folosești **propria ta bază de date**:
    1. Mergi în [Consola Firebase](https://console.firebase.google.com/).
    2. Creează un proiect nou.
    3. Adaugă o aplicație Web și copiază datele în fișierul `firebase-applet-config.json`.
    4. Activează **Firestore Database** și **Authentication (Google Login)** în consolă.

## 5. Tehnologii folosite
*   **React + Vite**: Motorul aplicației.
*   **Tailwind CSS**: Pentru design modern.
*   **Firebase**: Pentru salvarea progresului elevilor.
*   **Google Gemini**: Pentru asistentul AI inteligent.

---
Creat cu dragoste pentru elevii din Republica Moldova.
**Autori: Poleacov David, Bătrînu Beatrice. Coordonatori Lupașco Natalia și Căruceru Sergiu**
