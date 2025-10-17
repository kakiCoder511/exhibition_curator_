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

## 🚧 To-Do / Planned Improvements (Updated)

### 🖼️ User Experience
- ✅ Implemented **sort / filter options** (by artist, museum, date)
- ✅Add **artwork detail modal** with extended info & external museum link
- ✅Allow users to **rename exhibitions** or add short descriptions
- ✅Enhance **responsive layout** for mobile view

### 💾 Data & Persistence
- Extend beyond localStorage — add **backend (MongoDB/Firebase)** for permanent exhibition saving
- Generate **shareable exhibition URLs**
- (Optional) Add **user login / profile** for saved exhibitions

### ⚙️ Technical Enhancements
- ✅ Added **loading skeletons & error handling**
- Add **unit tests** for store logic & API clients

--- 

🧪 Tests planned but not required for MVP scope. Core logic verified manually.
