# Phase 1 Auth Verification

## Fixes applied
- Pinned `bcrypt<4` in `backend/requirements.txt` to avoid incompatibility between `passlib` and `bcrypt`.
- Updated `backend/app/schemas.py` so `UserResponse.created_at` is a `datetime` and `Config` uses `from_attributes = True` for Pydantic v2 compatibility.

## Verification
- `POST /auth/register` now returns `200` with created user data.
- `POST /auth/login` returns `200` with a valid JWT access token.
- `GET /users/me` returns `200` with the authenticated user's profile.

## Notes
- Backend is running at `http://localhost:8000`.
- Frontend remains available at `http://localhost:5173`.
