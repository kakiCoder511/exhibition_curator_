Name: Exhibition Curator (Next.js + TypeScript)
Setup
npm install
npm run dev
Visit http://localhost:3000.
Features
Search artworks from AIC / V&A / The Met
Build mini exhibition cart, save and view snapshots
Basic create/view flows with placeholders & provider metadata
Env
Optional: NEXT_PUBLIC_VAM_API_KEY (if the V&A API needs auth)
Scripts
npm run dev – local dev
npm run build / npm start – production build
npm run lint and npm test
Structure
src/
  app/          # Next.js app routes
  components/   # UI components (cards, cart, buttons, dialogs…)
  lib/          # API clients (aic, vam, met) + utils
  store/        # Zustand store for exhibitions
public/         # static assets and placeholders
Notes
Snapshots saved in browser localStorage
API clients catch errors and fall back to placeholder images