# Interview Command Center (ICC)

Single-service MERN app: Express serves the React (Vite) build and `/api` on one URL.

## Local development

```bash
# Terminal 1 — API
cd server && npm install && npm start

# Terminal 2 — Vite (http://localhost:5173 → API :5000)
cd client && npm install && npm run dev
```

Copy `server/.env.example` → `server/.env` (`MONGO_URI`, `ICC_ACCESS_PASSWORD`).

## Production / Render (one Web Service)

1. Create a **Web Service** from this repo (root directory = repo root).
2. **Build command:** `npm run build`
3. **Start command:** `npm start`
4. Env vars:
   - `NODE_ENV=production`
   - `MONGO_URI` — MongoDB Atlas connection string
   - `ICC_ACCESS_PASSWORD` — unlock password for the app
5. **Data:** On first boot, if Atlas is empty the server auto-seeds DSA + planner.
   To force a full reseed (wipes progress):

```bash
# Render Shell, or locally with Atlas MONGO_URI in server/.env
npm run seed
```

Optional: use `render.yaml` Blueprint for the same settings.

No separate frontend URL — open the Render service URL and enter your password.
