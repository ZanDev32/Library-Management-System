# Phase 1 — Plan 4: Frontend Authentication & Protected Routes

**Requirements:** F01 (User registration & login), NF03 (responsive)
**Depends on:** Plan 1 (frontend scaffold), Plan 3 (auth API must exist)
**Parallelizable:** No — needs the auth API from Plan 3

## Goal

Build the React auth layer: auth context (in-memory token management), API client with interceptors, login/register pages, and protected route wrappers. After this plan, the frontend handles the full auth lifecycle with the backend.

## Context

From `01-CONTEXT.md`:
- Access token in memory (JS variable), refresh in httpOnly cookie (browser handles)
- Students self-register
- Layered frontend: `api/`, `contexts/`, `pages/`, `components/`, `hooks/`

From `01-RESEARCH.md` §4:
- Axios interceptor for auth header + auto-refresh on 401
- React Router v6 ProtectedRoute pattern
- Refresh flow: 401 → interceptor calls /auth/refresh → retry or redirect to login

## Tasks

### Task 4.1: API client setup
- `frontend/src/api/client.ts`:
  - Create Axios instance with `baseURL = import.meta.env.VITE_API_URL || '/api'`
  - `withCredentials = true` (needed for httpOnly cookie)
  - Request interceptor: attach `Authorization: Bearer <token>` from auth context
  - Response interceptor: on 401, call `/auth/refresh` once, retry original request; if refresh fails, clear auth state

### Task 4.2: Auth context
- `frontend/src/contexts/AuthContext.tsx`:
  - State: `user` (null or UserResponse), `accessToken` (null or string), `loading` (boolean)
  - On mount: call `/auth/me` (without access token — refresh cookie handles it)
    - If success: set user and access token from response
    - If 401: set user=null (not logged in)
  - `login(email, password)` → POST /auth/login → store access token, fetch /auth/me
  - `register(email, password, full_name)` → POST /auth/register → redirect to login
  - `logout()` → POST /auth/logout → clear state
  - `getToken()` → return current access token (for interceptor)

### Task 4.3: Auth types
- `frontend/src/types/auth.ts`:
  - `User { id, email, full_name, role: 'student' | 'librarian', is_active, created_at }`
  - `LoginRequest { email, password }`
  - `RegisterRequest { email, password, full_name }`
  - `TokenResponse { access_token, token_type }`

### Task 4.4: Protected route component
- `frontend/src/components/ProtectedRoute.tsx`:
  - Wraps children, checks `AuthContext` for authenticated user
  - If loading → spinner
  - If not authenticated → redirect to `/login`
  - `RoleGuard` component: accepts allowed roles, returns 403 page if user role not in list

### Task 4.5: Login page
- `frontend/src/pages/Login.tsx`:
  - Form with email + password fields
  - Calls `login()` from AuthContext
  - On success → navigate to `/` (or dashboard)
  - On error → show inline error message
  - Link to register page
  - Mobile responsive layout

### Task 4.6: Register page
- `frontend/src/pages/Register.tsx`:
  - Form with full_name, email, password, confirm password
  - Client-side validation (required fields, password match, min length)
  - Calls `register()` from AuthContext
  - On success → show "Account created, please log in" + redirect to login
  - On error → show inline errors
  - Mobile responsive layout

### Task 4.7: Router setup
- `frontend/src/App.tsx`:
  - `<BrowserRouter>` with routes:
    - `/login` → Login (public)
    - `/register` → Register (public)
    - `/` → Home (protected)
  - `<AuthProvider>` wrapping all routes
  - `ProtectedRoute` wrapper on protected routes

### Task 4.8: Minimal home/dashboard page
- `frontend/src/pages/Home.tsx`:
  - Shows "Welcome, {user.full_name}" with role badge
  - Logout button
  - Minimal placeholder for Phase 2 (catalog) content
  - Mobile responsive

## Verification

- [ ] Navigate to `/` without login → redirects to `/login`
- [ ] Register a new student account → redirected to login page
- [ ] Login with new account → redirected to home showing user name and role
- [ ] Refresh the page → session persists (refresh cookie re-authenticates)
- [ ] Login with wrong password → error message shown, stays on login page
- [ ] Logout → redirected to `/login`, can't access `/`
- [ ] Pages render correctly on mobile viewport (375px width)

## Definition of Done

Frontend auth lifecycle is complete. Register, login, session persistence, and logout all work. Protected routes enforce authentication. The auth context and API client are established for future features to build on.
