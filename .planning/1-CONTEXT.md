# Phase 1 Context — Foundation

## Phase
- Phase: 1
- Name: Foundation
- Goal: Stand up the project skeleton, database, and a secure authentication system that later phases can build on.

## Phase boundary
Phase 1 delivers the core application scaffold and the security foundation only.

Included:
- Project scaffold for backend, frontend, and local containerized deployment.
- User registration and login flows.
- JWT-based authentication and role separation for `student` and `librarian`.
- Database schema and connection setup for PostgreSQL.
- Protected API route structure for downstream feature work.

Excluded:
- Book catalog search and display.
- Borrow request and return workflows.
- Librarian dashboard pages.
- Overdue handling and notifications.

## Locked decisions

### Tech stack and deployment
- Backend: FastAPI (Python)
- Frontend: React
- Database: PostgreSQL
- Deployment: Docker Compose with separate service containers for backend, frontend, and database
- Authentication: JWT tokens for API access

### Authentication and authorization
- Provide registration and login endpoints for both students and librarians.
- Store user roles in the user record and encode role claims in JWTs.
- Protect API routes so only authenticated requests with a valid JWT succeed.
- Enforce role-based authorization on routes that will later require librarian privileges.

### Project structure
- Backend and frontend must be separable services, but able to run together with a single `docker compose up` command.
- The backend should include a shared JDBC/ORM-style database layer for users and future book records.
- The frontend should include a skeleton login flow and authenticated route handling for later phase pages.

## Prior context
- Project-level requirements from `.planning/PROJECT.md` and `.planning/REQUIREMENTS.md` are in force.
- No prior phase-specific context exists for Phase 1.

## Notes for downstream agents
- `gsd-phase-researcher` should confirm whether any starter code currently exists in the repo. If none exists, validate the simplest containerized FastAPI + React scaffold that can be built from scratch.
- `gsd-planner` should plan Phase 1 only as a foundation layer, not as a full product feature phase.
