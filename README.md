# DidactAI Matematica - Ghid de configurare 

Salut! Acest ghid te va ajuta să pui aplicația ta pe internet (GitHub și Hosting) pas cu pas, chiar dacă ești la început.

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
**Autori: Poleacov Daavid, Bătrînu Beatrice. Coordonatori Lupașco Natalia și Căruceru Sergiu**