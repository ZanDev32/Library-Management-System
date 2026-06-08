# Phase 1 Research — Foundation

## Purpose
Research the best foundation implementation for the Library Management System project.

## Inputs
- `.planning/1-CONTEXT.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`

## Current repository state
- The repository currently contains only planning documents and no source code.
- The intended stack is FastAPI, React, PostgreSQL, and Docker.
- Phase 1 must deliver the skeleton and auth foundation before Phase 2 can build the catalog.

## Research findings

### Backend choices
- FastAPI is well suited for a foundational backend because it supports:
  - quick API endpoint creation
  - async database access
  - JWT authentication through standard extensions
- Recommended dependencies:
  - `fastapi`
  - `uvicorn`
  - `pydantic`
  - `python-jose` or `PyJWT` for JWT support
  - `passlib` for password hashing
  - `asyncpg` and `SQLAlchemy` / `Tortoise ORM` for PostgreSQL access
- Starting with a minimal user model and auth module avoids premature complexity.

### Frontend choices
- React is the chosen frontend framework.
- A minimal starting UI should include:
  - login page
  - registration page
  - authenticated app shell or dashboard placeholder
- Recommended libraries:
  - `react-router-dom` for routing
  - a lightweight component library or plain CSS for quick scaffolding
  - `axios` or `fetch` wrapper for API requests with JWT headers

### Deployment choices
- Docker Compose is appropriate for local development and university deployment.
- The compose stack should include:
  - `backend` service running FastAPI
  - `frontend` service serving React app (e.g. via `npm start` or built static files)
  - `db` service running PostgreSQL
- Environment variables should configure database URL and JWT secret.

### Authentication design
- JWT tokens should be issued at login and refreshed through standard expiration logic.
- User records should minimally include:
  - `id`
  - `name`
  - `email`
  - `hashed_password`
  - `role` (`student` or `librarian`)
  - `created_at`
- Role claims should be embedded in the JWT so backend authorization can inspect them per request.

## Recommended approach
1. Scaffold an empty `backend/` and `frontend/` workspace if no code exists.
2. Create `docker-compose.yml` with backend, frontend, and PostgreSQL services.
3. Implement PostgreSQL connectivity and database schema migration for users.
4. Implement auth routes: `POST /auth/register`, `POST /auth/login`, and a protected health or user-info route.
5. Implement frontend login and registration pages with JWT storage in local storage or cookies.
6. Ensure protected frontend routes are accessible only after authentication.

## Open questions
- Should JWTs be stored in an HTTP-only cookie or local storage for this academic app? (Local storage is simpler for Phase 1.)
- Should token refresh be implemented in Phase 1, or deferred to a later phase? (Phase 1 likely only needs basic login tokens with reasonable expiry.)
