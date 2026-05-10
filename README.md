# JaanHith Sathi

Deploy-ready baseline:

- Frontend: Vite app in `frontend`, host on Firebase Hosting.
- Backend: FastAPI app in `backend`, host on Render.

## Frontend env

Create `frontend/.env`:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

## Backend env

Create `backend/.env`:

```env
APP_NAME=CivicGuide AI Backend
ENVIRONMENT=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
CORS_ORIGINS=https://your-firebase-site.web.app,https://your-firebase-site.firebaseapp.com
NVIDIA_API_KEY=your_key_if_chat_rag_enabled
```

## Firebase deploy

```bash
cd frontend
npm install
npm run build
firebase login
firebase use --add
firebase deploy --only hosting
```

`frontend/firebase.json` already rewrites all routes to `index.html`.

## Render deploy

Create new Render web service from repo and point root to `backend`, or use [`backend/render.yaml`](backend/render.yaml).

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Health check:

```text
/health
```

Production note:

- Do not use SQLite on Render for persistent app data. Render filesystem is ephemeral.
- Use Render Postgres and set `DATABASE_URL` to that connection string.

## Notes

- Frontend now uses `VITE_API_BASE_URL` instead of hardcoded localhost.
- Backend now uses env-driven CORS and DB config.
- Chat RAG imports lazy-load, so app can boot even before heavy AI path first used.
