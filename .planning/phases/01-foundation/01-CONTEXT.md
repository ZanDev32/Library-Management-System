# Phase 1: Foundation - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase stands up the project skeleton that every later feature builds on: a
Dockerized FastAPI + React + PostgreSQL development environment, the core
database schema (users, books, borrow records), and a secure JWT-based
authentication system with student/librarian role separation.

**In scope:** Project scaffold, Docker Compose setup, DB schema, user
registration/login, JWT issuance + verification, role separation.

**Out of scope:** Catalog search (Phase 2), borrowing lifecycle (Phase 3),
dashboard (Phase 4), password reset/email flows, OAuth, fine payment.

</domain>

<decisions>
## Implementation Decisions

### Authentication Flow
- **D-01:** Use **access + refresh token** scheme. Short-lived access JWT plus a
  long-lived refresh token. Stateless access tokens; refresh enables silent
  re-authentication without re-login.
- **D-02:** **Token storage** — refresh token in an **httpOnly cookie**, access
  token held **in memory** (JS variable) on the frontend. This is the most
  XSS-resistant layout; access token is never persisted to localStorage.
- **D-03:** **Registration policy** — students **self-register** (open signup as
  role=student). Librarian accounts are NOT self-selectable; they are created by
  an existing librarian/admin or seeded. Registration endpoint must not allow a
  caller to assign themselves the librarian role.

### Project Structure
- **D-04:** **Monorepo layout** — single repository root with `backend/` and
  `frontend/` directories side by side, plus a shared `docker-compose.yml` at
  root.
- **D-05:** **Docker Compose services** — three services: `backend` (FastAPI),
  `frontend` (React/Vite), and `db` (PostgreSQL). Frontend runs the Vite dev
  server in development and a static build in production. No nginx proxy in this
  phase.
- **D-06:** **Backend internal layout** — layered by type: `routers/`,
  `models/`, `schemas/`, `services/`, `core/`. Standard FastAPI structure.

### the agent's Discretion
- Specific JWT library (e.g., `python-jose` vs `pyjwt`), password hashing lib
  (`passlib`/`bcrypt`), and exact token TTL values — choose sensible, secure
  defaults during planning/research.
- ORM choice (e.g., SQLAlchemy) and migration tooling (e.g., Alembic).
- Exact cookie attributes (SameSite, Secure flags) — apply secure defaults.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level specs
- `PROJECT_SPEC.md` — Human-written project brief (background, scope, tech stack
  hints: FastAPI, React, PostgreSQL, Docker).
- `.planning/PROJECT.md` — Structured, ID-tagged requirements. F01 (registration
  & login), NF02 (JWT security) are this phase's targets.
- `.planning/ROADMAP.md` §"Phase 1 — Foundation" — Deliverables and Definition
  of Done for this phase.

No additional external ADRs — implementation decisions captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. No source code exists beyond planning docs.

### Established Patterns
- None established. This phase sets the foundational patterns (project layout,
  auth, DB access) that later phases will follow.

### Integration Points
- This phase IS the integration substrate: the DB schema, auth middleware, and
  Docker environment defined here are what Phases 2–4 plug into.

</code_context>

<specifics>
## Specific Ideas

- Roles are a simple two-value distinction (student / librarian) — modeled as a
  role field/enum on the user, not a granular permissions table (confirmed by
  the registration decision; role enforcement details left to planning).
- Schema must cover three core entities now (users, books, borrow records) even
  though books/borrowing features land in later phases — the foundation lays the
  full schema so later phases only add behavior.

</specifics>

<deferred>
## Deferred Ideas

- Password reset / email verification flows — out of scope; not in roadmap.
- OAuth / social login — not in scope (PROJECT.md excludes it for this build).
- nginx reverse proxy + production topology — deferred; revisit in Phase 4
  (Polish) if production hardening is needed.

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-06-08*
