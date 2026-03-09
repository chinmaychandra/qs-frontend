# QuantumShield Frontend

A **Post-Quantum Cryptography (PQC) scanning dashboard** built with **React + TypeScript + Vite**, styled with **Tailwind CSS (v4)** and enhanced with Framer Motion animations.

This repo contains the frontend UI for a mock security dashboard that scans public-facing assets and categorizes them by quantum risk tiers.

---

## 🚀 Running Locally

```bash
cd frontend
npm install
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

---

## 🧱 Build

```bash
cd frontend
npm run build
```

The production output is generated into `frontend/dist`.

---

## 🧠 What’s Included

### ✨ UI Features

- **Matrix rain login background** (canvas animation)
- Animated **dashboard cards**, **progress bars**, **toast errors**, and **panels**
- Fully interactive **asset inventory** with drawers + filtering

### 🧩 Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS v4 (via `@tailwindcss/postcss` plugin)
- Framer Motion
- Zustand (state store)
- Recharts (charts)

---

## 🚧 Notes

- This is a mock/demo UI with hardcoded data in `src/store/index.ts`.
- The scan flow is simulated and does not call a real backend.

---

## ✅ Useful Commands

- `npm run dev`: start dev server
- `npm run build`: build production bundle
- `npm run preview`: serve the production build locally

---

If you want the repo to be set up with a GitHub Actions workflow or a deployment pipeline (Netlify/Vercel), just say so and I’ll add it.
