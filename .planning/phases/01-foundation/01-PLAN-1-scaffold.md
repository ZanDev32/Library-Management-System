# Phase 1 — Plan 1: Project Scaffold & Docker Environment

**Requirements:** Foundation (enables F01, NF02)
**Depends on:** None (first plan)
**Parallelizable:** No — other plans depend on this scaffold

## Goal

Create the monorepo structure with `backend/` and `frontend/` directories, a working Docker Compose setup with three services (backend, frontend, db), and environment configuration. After this plan, `docker compose up` brings an empty-but-running full stack online.

## Context

From `01-CONTEXT.md`:
- Monorepo layout: `backend/` + `frontend/` side by side, shared `docker-compose.yml` at root
- 3 Docker Compose services: backend (FastAPI), frontend (React/Vite), db (PostgreSQL)
- Frontend runs Vite dev server in development

## Tasks

### Task 1.1: Root project structure
- Create root `.gitignore` (Python, Node, `.env`, `__pycache__`, `node_modules`, `dist`)
- Create root `.env.example` with placeholders: `DB_PASSWORD`, `SECRET_KEY`, `DATABASE_URL`
- Create root `README.md` with setup instructions (`docker compose up`)

### Task 1.2: Backend scaffold
- Create `backend/` with the layered structure:
  ```
  backend/app/{core,models,schemas,routers,services}/__init__.py
  backend/app/main.py
  backend/requirements.txt
  backend/Dockerfile
  ```
- `requirements.txt` with pinned deps (fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, python-jose[cryptography], passlib[bcrypt], pydantic-settings, python-multipart)
- `main.py`: FastAPI app factory with CORS middleware (allow Vite origin, credentials=True), a `/health` endpoint returning `{"status": "ok"}`
- `Dockerfile`: python:3.12-slim base, install deps, run uvicorn with `--reload`

### Task 1.3: Core config module
- `backend/app/core/config.py`: `pydantic-settings` `Settings` class reading `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `CORS_ORIGINS`
- Singleton `settings` instance

### Task 1.4: Frontend scaffold
- Create `frontend/` with Vite + React + TypeScript:
  ```
  frontend/src/{api,components,contexts,pages,hooks,types}/
  frontend/src/{App.tsx,main.tsx}
  frontend/index.html
  frontend/package.json
  frontend/vite.config.ts
  frontend/tsconfig.json
  frontend/Dockerfile
  ```
- `package.json` with React 19, react-router-dom 7, axios, vite 6, typescript
- `vite.config.ts`: server host `0.0.0.0`, port 5173 (for Docker)
- `App.tsx`: minimal placeholder showing "Library Management System"
- `Dockerfile`: node:20-alpine, install deps, run `npm run dev -- --host`

### Task 1.5: Docker Compose
- Create root `docker-compose.yml` with three services per RESEARCH.md §3:
  - `db`: postgres:16-alpine, named volume, healthcheck (pg_isready)
  - `backend`: build ./backend, depends_on db (service_healthy), bind mount, port 8000, env from DATABASE_URL/SECRET_KEY
  - `frontend`: build ./frontend, depends_on backend, port 5173, bind mount with node_modules exclusion
- Named volume `postgres_data`

## Verification

- [ ] `docker compose up --build` starts all three services without errors
- [ ] `curl http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] `http://localhost:5173` shows the placeholder React app
- [ ] DB healthcheck passes; backend waits for DB before starting
- [ ] `.env` is gitignored; `.env.example` is committed

## Definition of Done

The full stack runs via `docker compose up`. Backend health endpoint responds, frontend renders, database is reachable. No auth or schema yet — that's plans 2–4.
