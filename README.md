# im-on-work

ImOnWork — The simplest todo list app in your life.

## Stack

- Frontend: React 18 + TypeScript + Vite + TailwindCSS v4 + Framer Motion
- Backend: Flask + SQLite (document-style single-row store)

## Run

### 1. Backend (SQLite + Flask)

```bash
python3 -m venv server/venv
server/venv/bin/pip install -r server/requirements.txt
npm run server   # serves http://127.0.0.1:5000
```

### 2. Frontend (Vite dev server)

```bash
npm install
npm run dev      # serves http://localhost:3000
```

The Vite dev server proxies `/api/*` to the Flask backend on port 5000.

## Data

State is stored in `server/data/imonwork.sqlite3` (auto-created, gitignored).
The API exposes `GET /api/state` and `PUT /api/state`; the client debounces
saves by 600ms and reloads from the DB on mount.

## Scripts

- `npm run dev` — Vite dev server
- `npm run server` — Flask + SQLite API
- `npm run build` — production build
- `npm run typecheck` — TypeScript type check
