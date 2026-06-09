# Library Management System — Universitas XYZ

A web-based Library Management System for campus-wide book catalog browsing, borrowing, and management.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ZanDev32/Library-Management-System.git
cd Library-Management-System

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values (especially SECRET_KEY and DB_PASSWORD)

# 3. Start all services
docker compose up --build

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

## Architecture

```
├── backend/          # FastAPI (Python) — REST API
├── frontend/         # React + Vite (TypeScript) — SPA
├── docker-compose.yml
└── .env.example
```

**Services:**
| Service | Port | Description |
|---------|------|-------------|
| frontend | 5173 | React + Vite dev server |
| backend | 8000 | FastAPI with uvicorn |
| db | 5432 | PostgreSQL 16 |

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy (async), Alembic, PostgreSQL
- **Frontend:** React 19, TypeScript, Vite 6, React Router 7, Axios
- **Auth:** JWT (access + refresh tokens)
- **Infra:** Docker Compose

## Development

```bash
# Run database migrations
docker compose exec backend alembic upgrade head

# View API documentation
open http://localhost:8000/docs
```

## Project Structure

```
backend/
├── app/
│   ├── core/       # Config, security, dependencies
│   ├── models/     # SQLAlchemy models
│   ├── schemas/    # Pydantic request/response schemas
│   ├── routers/    # API route handlers
│   └── services/   # Business logic
├── alembic/        # Database migrations
└── requirements.txt

frontend/
├── src/
│   ├── api/        # Axios client & interceptors
│   ├── components/ # Reusable UI components
│   ├── contexts/   # React contexts (auth)
│   ├── hooks/      # Custom hooks
│   ├── pages/      # Route-based pages
│   └── types/      # TypeScript types
└── package.json
```
