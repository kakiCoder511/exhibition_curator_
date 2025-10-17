# 🎨 Exhibition Curator (Next.js + TypeScript)

A virtual exhibition builder that allows users to **search artworks from multiple museum collections**, curate their own mini exhibitions, and save snapshots — all in the browser.

---

##  Setup

```bash
npm install
npm run dev
```

Then visit http://localhost:3000 (or the port shown in your terminal)**

---

##  Features

-  Search artworks from **AIC**, **V&A**, and **The Met** collections  
-  Add artworks to a **mini exhibition cart**  
-  Save and view **exhibition snapshots** directly in the browser  
-  Unified API response model with provider metadata  
-  Placeholder images and graceful error handling

---

##  Environment Variables

Optional:

```
NEXT_PUBLIC_VAM_API_KEY=<your_api_key_here>
```

*(Only required if the V&A API enforces authentication)*

---

##  Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start local development server |
| `npm run build` / `npm start` | Build and run production app |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

---

## 📁 Project Structure

```
src/
  app/          # Next.js app routes
  components/   # UI components (cards, cart, buttons, dialogs…)
  lib/          # API clients (aic, vam, met) + shared utils
  store/        # Zustand store for exhibition state
public/         # Static assets and placeholders
```

---

##  Notes

- Exhibition snapshots are stored in **browser localStorage**  
- API clients include **fallbacks** for failed requests and missing images  
- Designed with **responsive layout** and **accessibility** in mind  
- Hosted using a **free tier platform** (e.g. Vercel)

---

## 🖼️ About the Project

This project was developed for the **Skills Bootcamp: Software Developer / Coding Skills Graduates – Software Engineering** module.

> The app empowers art lovers, students, and researchers to explore and curate their own virtual exhibitions from open museum APIs — combining art, code, and curation into one interactive experience.