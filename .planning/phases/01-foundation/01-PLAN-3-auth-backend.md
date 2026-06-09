# Phase 1 — Plan 3: Backend Authentication

**Requirements:** F01 (User registration & login), NF02 (JWT security)
**Depends on:** Plan 1 (scaffold), Plan 2 (User model)
**Parallelizable:** No — needs User model from Plan 2

## Goal

Implement the full auth flow: registration, login, token refresh, logout. Enforce JWT-based access control with role separation. After this plan, the API authenticates users and protects routes.

## Context

From `01-CONTEXT.md`:
- Access + refresh token scheme (short-lived access JWT + long-lived refresh in httpOnly cookie)
- Students self-register; librarian accounts seeded or admin-created
- Registration endpoint must NOT allow caller to assign librarian role

From `01-RESEARCH.md` §1:
- python-jose for JWT, passlib[bcrypt] for passwords
- Access token: 15–30 min TTL, in response body
- Refresh token: 7–30 days, httpOnly cookie, rotated on use
- CORS with credentials=True

## Tasks

### Task 3.1: Security utilities
- `backend/app/core/security.py`:
  - `hash_password(password: str) -> str` — bcrypt via passlib
  - `verify_password(plain: str, hashed: str) -> bool`
  - `create_access_token(data: dict, expires_delta: timedelta | None) -> str` — JWT with `sub`, `role`, `exp`
  - `create_refresh_token(data: dict) -> str` — longer TTL, same structure
  - `decode_token(token: str) -> dict` — validate and decode, raise on invalid/expired

### Task 3.2: Auth schemas
- `backend/app/schemas/user.py`:
  - `UserCreate(email, password, full_name)` — no role field (always student)
  - `UserLogin(email, password)`
  - `UserResponse(id, email, full_name, role, is_active, created_at)`
  - `TokenResponse(access_token, token_type)`

### Task 3.3: Auth dependencies
- `backend/app/core/deps.py`:
  - `get_db()` — async session generator
  - `get_current_user(token, db)` — extract Bearer token, decode, fetch user, raise 401
  - `get_current_active_user(user)` — check is_active
  - `require_librarian(user)` — raise 403 if role != librarian

### Task 3.4: Auth service layer
- `backend/app/services/auth.py`:
  - `register_user(db, user_create) -> User` — check email unique, hash password, create with role='student'
  - `authenticate_user(db, email, password) -> User | None` — verify credentials
  - `refresh_tokens(db, refresh_token) -> tuple[str, str]` — validate refresh, issue new pair

### Task 3.5: Auth router
- `backend/app/routers/auth.py`:
  - `POST /auth/register` → 201, returns UserResponse + sets refresh cookie
  - `POST /auth/login` → 200, returns TokenResponse + sets refresh cookie
  - `POST /auth/refresh` → 200, reads refresh cookie, returns new access token + rotates cookie
  - `POST /auth/logout` → 200, clears refresh cookie
  - `GET /auth/me` → 200, returns current user (protected route)

### Task 3.6: Cookie configuration
- Set refresh token cookie with:
  - `httponly=True`
  - `samesite="lax"`
  - `secure=False` (dev; True in prod via config)
  - `path="/auth/refresh"` (limits cookie scope)
  - `max_age` matching refresh token TTL

### Task 3.7: Wire routes into app
- Import and include `auth_router` in `main.py` with prefix `/auth`
- Ensure CORS middleware is configured before routes

### Task 3.8: Seed librarian script
- `backend/app/core/seed.py` or `backend/scripts/seed_librarian.py`:
  - Creates a default librarian account if none exists
  - Reads credentials from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
  - Runs on app startup or as a CLI command

## Verification

- [ ] `POST /auth/register` with email+password creates a student user, returns token
- [ ] `POST /auth/register` with role=librarian in body is rejected or ignored (always student)
- [ ] `POST /auth/login` with valid creds returns access_token + sets httpOnly cookie
- [ ] `POST /auth/login` with invalid creds returns 401
- [ ] `POST /auth/refresh` with valid cookie returns new access token
- [ ] `POST /auth/refresh` with expired/invalid cookie returns 401
- [ ] `GET /auth/me` with valid token returns user profile
- [ ] `GET /auth/me` without token returns 401
- [ ] Librarian-only endpoint returns 403 for student role

## Definition of Done

Full auth lifecycle works end-to-end via API calls. Students register, both roles login, tokens refresh, and role-based access control is enforced.
