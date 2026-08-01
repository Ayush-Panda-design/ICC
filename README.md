# Interview Command Center (ICC)

A single-service MERN app that replaces a scattered set of spreadsheets, Notion pages, and browser tabs with one dashboard for interview prep — daily tasks, DSA tracking, company applications, mock interviews, and accountability nudges, all in one place.

Built as a personal tool: password-gated, single-user, and opinionated about what "ready" looks like on any given day.

## Why this exists

Most interview-prep tracking ends up split across a DSA sheet, a notes app for core CS revision, a spreadsheet for company applications, and a to-do list for the day's plan — with nothing tying them together or telling you if you're actually on pace. ICC merges all of that into one app with a single "today" view and a coach layer that reacts to what you have and haven't done.

## Features

**Daily planner & dashboard**
- A single "today" view aggregating DSA, core CS, tech revision, and application tasks for the day
- Mark individual tasks or the whole day complete
- Weekly checkpoints to track progress against a longer-term plan

**DSA tracker**
- Problem list organized by topic and pattern
- Pattern-based catalog (e.g. common patterns) and a dedicated OA (online assessment) prep pack
- Per-problem progress tracking

**Company & applications tracker**
- Company database with live job-board syncing (Greenhouse, Lever, Ashby, Remotive adapters)
- Auto-detects when a company's board opens/closes and surfaces roles as they go live
- "For You" matching — scores companies against your profile/portfolio to surface the best-fit openings
- Per-company "apply kit" with quick-apply context
- Automated URL health checks and self-repair for stale job-board links
- Application status tracking (applied, in progress, rejected, etc.)

**Interview prep modules**
- Mock interview log
- Timed OA (Online Assessment) sessions
- System design drills
- STAR-format behavioral story bank, with a "random" mode for practice
- Core CS flashcard deck with a quiz mode
- A themed "Google hard day" prep mode for high-difficulty practice sets

**Notices & hiring calendar**
- Aggregated hiring-season calendar and live openings feed
- AI/market-status brief pulled into a notice board

**Coach layer**
- Rule-based accountability engine that reacts to what's done vs. pending each day
- Optional Gemini integration to polish message tone (the rule engine works standalone without an API key)
- Push notifications for nudges and status changes

**Real-time updates**
- Socket.IO powers live updates across the dashboard (e.g. task completion, notification pushes) without a page refresh

**Access control**
- Single shared-password gate (`ICC_ACCESS_PASSWORD`) protects the whole API; the SPA shell stays public so the login screen can load
- Auth can be fully disabled for local development by leaving the password unset

## Tech stack

**Frontend** — React 18 (Vite), React Router, Tailwind CSS v4, Recharts, Axios, Socket.IO client, react-hot-toast, date-fns, lucide-react

**Backend** — Node.js, Express, MongoDB (Mongoose), Socket.IO, Helmet, CORS, node-cron (scheduled alerts)

**Infra** — Single Render Web Service serves both the built React app and the `/api`, backed by MongoDB Atlas

## Architecture

This is a single-service deployment: Express serves the compiled Vite build as static assets and handles `/api/*` on the same origin — no separate frontend URL or CORS juggling in production.

```
ICC/
├── client/          React + Vite frontend
│   └── src/
│       ├── pages/       Dashboard, DSA Tracker, Applications, Checkpoints,
│       │                Daily Planner, Dojo, Notices, Notifications, Alerts...
│       ├── api/         API client wrappers
│       └── hooks/       Shared React hooks
├── server/          Express API + Socket.IO
│   ├── routes/          dashboard, tasks, dsa, applications, companies,
│   │                    checkpoints, prep, coach, notices, notifications, auth
│   ├── models/           Mongoose schemas (User, DailyTask, DSAProblem,
│   │                     Company, Application, MockInterview, StarStory,
│   │                     DesignDrill, CoreCSCard, OASession, ...)
│   ├── services/
│   │   ├── coach/        Accountability / nudge engine
│   │   ├── jobSync/       Job-board adapters, live hub definitions, URL health & repair
│   │   └── notices/      Hiring calendar + notice brief aggregation
│   ├── middleware/       Shared-password auth gate
│   ├── cron/             Scheduled alert jobs
│   └── seed/             Seed scripts + JSON seed data (DSA problems, planner, companies, etc.)
└── render.yaml       Render Blueprint for one-click deploy config
```

## Getting started

### Prerequisites
- Node.js 20.x
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### Local development

Run the API and the Vite dev server in two terminals:

```bash
# Terminal 1 — API
cd server && npm install && npm start

# Terminal 2 — Vite dev server (http://localhost:5173 → proxies to API on :5000)
cd client && npm install && npm run dev
```

Then copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

```env
MONGO_URI=mongodb://localhost:27017/interview-command-center
PORT=5000
NODE_ENV=development

# Leave empty to disable auth entirely for local dev
ICC_ACCESS_PASSWORD=

# Optional
# CORS_ORIGINS=https://your-app.onrender.com
# GEMINI_API_KEY=            # polishes coach message tone; rule engine works without it
# LIVEHUB_*_URL=             # override default job-board hub URLs
```

Open `http://localhost:5173`. If `ICC_ACCESS_PASSWORD` is unset, the app skips the login gate entirely.

### Seeding data

The server auto-seeds DSA problems and the daily planner on first boot if the database is empty. To force a full reseed:

```bash
cd server && npm run seed
# or, DSA problems only:
npm run seed:dsa
```

## Deployment (Render — single service)

1. Create a **Web Service** from this repo (root directory = repo root).
2. **Build command:** `npm run build`
3. **Start command:** `npm start`
4. Set environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `ICC_ACCESS_PASSWORD` — password used to unlock the app
5. After the first deploy, if Atlas is empty the server auto-seeds on boot. To force a full reseed later:
   ```bash
   # Render Shell, or locally with your Atlas MONGO_URI set in server/.env
   npm run seed
   ```

Alternatively, use the included `render.yaml` Blueprint to provision the same service with one click.

There's no separate frontend URL to manage — open the Render service URL directly and log in with your password.

## Roadmap / ideas

- [ ] Export weekly progress as a shareable report
- [ ] More job-board adapters beyond Greenhouse/Lever/Ashby
- [ ] Configurable coach tone/aggressiveness

## License

Personal project — no license specified. Feel free to open an issue if you'd like to reuse parts of it.

---

Built by [Ayush Panda](https://github.com/Ayush-Panda-design) — part of a series of production-style tools built to actually get used, not just sit in a repo.
