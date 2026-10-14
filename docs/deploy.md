# Deployment — Vercel + Railway

## Overview

| Component | Host | Build |
|-----------|------|-------|
| Frontend (Next.js) | [Vercel](https://vercel.com) | Root directory `frontend/` |
| API (FastAPI) | [Railway](https://railway.app) | [`backend/Dockerfile`](../backend/Dockerfile) |

Local parity: [`docker-compose.yml`](../docker-compose.yml) runs the API on port 8000.

## Backend (Railway)

1. Create a service from this repository; set **Dockerfile path** to `backend/Dockerfile` (build context = repo root).
2. **Environment variables:**
   - `PORT` — injected by Railway (default 8000 in Dockerfile).
   - `ALLOWED_ORIGINS` — comma-separated frontend origins, e.g.  
     `https://your-app.vercel.app,https://your-app-*.vercel.app`  
     (use your exact production and preview URLs; wildcard support depends on your CORS policy — list each preview pattern you need).
3. **Health check:** `GET /api/health` → expect HTTP 200.
4. Note the public URL, e.g. `https://cv-lab-api.up.railway.app`.

System packages in the Dockerfile cover OpenCV headless (`libgl1`, `glib`).

## Frontend (Vercel)

1. Import the repository; set **Root Directory** to `frontend`.
2. **Environment variable:**
   - `NEXT_PUBLIC_API_URL` = Railway API URL (no trailing slash).
3. Deploy. Preview branches receive their own URLs — add each to `ALLOWED_ORIGINS` on Railway when testing previews.

## Local full stack

```bash
docker compose up --build   # API on :8000
cd frontend && cp .env.example .env.local && npm ci && npm run dev
```

`.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Verification

- `curl -s "$API_URL/api/health"`
- Open the Vercel site, upload a PNG, confirm timing and download work.
- Run E2E locally: `cd frontend && npm run test:e2e` (starts API + dev server automatically).
