# Library Management System

A university library management system built with FastAPI, React, and PostgreSQL.

## Run locally with Docker

1. Start the stack:
   ```bash
docker compose up --build
```
2. Backend: `http://localhost:8000`
3. Frontend: `http://localhost:5173`

## Seed credentials

A default librarian account is seeded automatically when the backend starts:

- email: `librarian@example.com`
- password: `librarianpassword`

## Notes

- Register new student users with `/auth/register`.
- Use JWT tokens returned from `/auth/login` to call protected endpoints.
- The frontend expects the backend API at `http://backend:8000` inside Docker Compose.
