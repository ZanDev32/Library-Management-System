# Phase 1 UAT

## Scope
Validate Phase 1 auth foundation: backend auth API, JWT login, protected user profile route, and frontend register/login flow wiring.

## Test results

- `GET /health`
  - Result: 200 OK
  - Confirms backend service is reachable.

- `POST /auth/register`
  - Result: 200 OK
  - Response included created user data: `id`, `name`, `email`, `role`, `created_at`.

- `POST /auth/login`
  - Result: 200 OK
  - Response included a valid `access_token` and `token_type: bearer`.

- `GET /users/me` with bearer token
  - Result: 200 OK
  - Response returned authenticated user profile matching the registered account.

## Frontend verification

- `frontend/src/pages/Register.jsx` implements the registration form and then logs in the new user.
- `frontend/src/pages/Login.jsx` implements the login form and then fetches `/users/me` with the saved bearer token.
- `frontend/src/api.js` correctly points at `VITE_BACKEND_URL` or `http://localhost:8000` and sends request payloads as expected.
- `frontend/src/App.jsx` routes `/login` and `/register` correctly and guards `/` behind authenticated user state.

## Conclusion
Phase 1 auth foundation is working. The backend auth endpoints and JWT-protected profile route are validated, and the frontend auth pages are wired to those endpoints.
