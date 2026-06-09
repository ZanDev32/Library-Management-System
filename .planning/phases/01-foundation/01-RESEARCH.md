# Phase 1: Foundation — Research

## 1. FastAPI + JWT Auth (Access + Refresh Token)

### Recommended Stack
- **JWT library:** `python-jose[cryptography]` — actively maintained, good ecosystem support, supports JWK
- **Password hashing:** `passlib[bcrypt]` — standard for FastAPI projects; bcrypt with auto-rounds
- **CORS:** `fastapi.middleware.cors.CORSMiddleware` — must allow `credentials: true` for httpOnly cookies

### Access + Refresh Token Pattern
1. **Access token:** Short-lived (15–30 min), stateless JWT in response body. Client stores in JS variable (memory). Sent as `Authorization: Bearer <token>` header.
2. **Refresh token:** Long-lived (7–30 days), stored in httpOnly cookie. Used to obtain a new access token without re-login. Server validates on `/auth/refresh` endpoint.
3. **Rotation:** On refresh, issue BOTH a new access token AND a new refresh token (rotation). Old refresh token is invalidated.
4. **Logout:** Clear the refresh cookie. Access token expires naturally.

### CORS Configuration
```
allow_origins=["http://localhost:5173"]  # Vite dev server
allow_credentials=True                    # Required for httpOnly cookies
allow_methods=["*"]
allow_headers=["*"]
```

### Security Gotchas
- Access token must NOT be stored in localStorage — XSS vulnerability
- httpOnly cookie must have `SameSite=Lax` or `SameSite=Strict` — prevents CSRF
- In production, cookie must have `Secure=True` — HTTPS only
- Refresh token rotation prevents token replay attacks
- Use `sub` claim for user ID, `role` for authorization

---

## 2. SQLAlchemy + Alembic Schema

### Schema Design

**users**
- `id`: UUID (primary key) — better than auto-increment for distributed systems
- `email`: String, unique, indexed
- `hashed_password`: String
- `role`: Enum('student', 'librarian'), default='student'
- `is_active`: Boolean, default=True
- `created_at`: DateTime, server_default=now()
- `updated_at`: DateTime, onupdate=now()

**books**
- `id`: UUID (primary key)
- `title`: String, indexed
- `author`: String, indexed
- `isbn`: String, unique, indexed
- `quantity`: Integer, default=1
- `available_quantity`: Integer, default=1
- `created_at`: DateTime
- `updated_at`: DateTime

**borrow_records**
- `id`: UUID (primary key)
- `user_id`: ForeignKey(users.id)
- `book_id`: ForeignKey(books.id)
- `status`: Enum('pending', 'approved', 'rejected', 'returned', 'overdue')
- `borrow_date`: DateTime, nullable
- `due_date`: DateTime, nullable
- `return_date`: DateTime, nullable
- `created_at`: DateTime
- `updated_at`: DateTime

### Async vs Sync
- Use **async SQLAlchemy** with `AsyncSession` and `AsyncEngine` — FastAPI is async-native
- Alembic can use sync engine for migrations (doesn't need async)
- Use `create_async_engine` with `asyncpg` driver

### Alembic Setup
- Initialize with `alembic init alembic`
- Configure `sqlalchemy.url` to use `postgresql+asyncpg://` in env.py
- Use `target_metadata = Base.metadata` for autogenerate
- First migration: create all tables

---

## 3. Docker Compose Topology

### Services
```yaml
services:
  db:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: lms_db
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    healthcheck: pg_isready -U lms_user -d lms_db

  backend:
    build: ./backend
    depends_on: { db: { condition: service_healthy } }
    volumes: [./backend:/app]
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql+asyncpg://lms_user:${DB_PASSWORD}@db:5432/lms_db
      SECRET_KEY: ${SECRET_KEY}

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["5173:5173"]
    volumes: [./frontend:/app, /app/node_modules]
```

### Key Decisions
- Use **Alpine images** for smaller footprint
- **Health checks** on DB ensure backend waits for DB readiness
- **Named volume** for PostgreSQL data persistence across restarts
- Backend and frontend use **bind mounts** for hot reload in dev
- Frontend volume excludes `node_modules` to avoid host/container conflicts

### Environment Management
- Use `.env` file at project root (gitignored) for secrets
- `.env.example` committed with placeholder values
- Docker Compose reads `.env` automatically

---

## 4. React + Vite Scaffold

### Recommended Structure
```
frontend/
├── src/
│   ├── api/          # Axios instance, interceptors
│   ├── components/   # Reusable UI components
│   ├── contexts/     # Auth context (token state)
│   ├── pages/        # Route-based page components
│   ├── hooks/        # Custom hooks (useAuth, etc.)
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
└── package.json
```

### Auth State Management
- Store access token in React state (Context or Zustand)
- On page load, call `/auth/refresh` if refresh cookie exists → get new access token
- Axios interceptor: attach `Authorization: Bearer <token>` to every request
- Axios interceptor: on 401, attempt refresh → if refresh fails, redirect to login

### Protected Routes
- Use React Router v6 with a `ProtectedRoute` wrapper component
- Wrapper checks auth context → redirects to `/login` if unauthenticated
- Role-based routes: librarian-only pages wrapped in `RoleGuard`

### Token Refresh Flow
```
Request → 401 response → interceptor calls /auth/refresh → 
  Success: retry original request with new token
  Failure: clear token, redirect to /login
```

---

## 5. Backend Layered Structure

### Directory Layout
```
backend/
├── app/
│   ├── core/
│   │   ├── config.py      # Pydantic Settings (env vars)
│   │   ├── security.py    # JWT creation/validation, password hashing
│   │   └── deps.py        # FastAPI dependencies (get_db, get_current_user)
│   ├── models/
│   │   ├── user.py         # SQLAlchemy User model
│   │   ├── book.py         # SQLAlchemy Book model
│   │   └── borrow.py       # SQLAlchemy BorrowRecord model
│   ├── schemas/
│   │   ├── user.py         # Pydantic request/response schemas
│   │   ├── book.py
│   │   └── borrow.py
│   ├── routers/
│   │   ├── auth.py         # POST /auth/register, /auth/login, /auth/refresh, /auth/logout
│   │   ├── books.py        # CRUD endpoints
│   │   └── borrow.py       # Borrow request/return endpoints
│   ├── services/
│   │   ├── auth.py         # Business logic for auth
│   │   ├── book.py         # Business logic for books
│   │   └── borrow.py       # Business logic for borrowing
│   └── main.py             # FastAPI app factory, middleware, CORS
├── alembic/                 # Migrations
├── alembic.ini
├── Dockerfile
└── requirements.txt
```

### Dependency Injection Pattern
```python
# deps.py
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # Decode JWT, fetch user, raise 401 if invalid
```

### Config Management
- Use `pydantic-settings` with `BaseSettings` class
- Load from environment variables + `.env` file
- Separate configs for dev/test/prod via class inheritance

---

## 6. Dependencies (with versions)

### Backend
```
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
sqlalchemy[asyncio]>=2.0.36
asyncpg>=0.30.0
alembic>=1.14.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic-settings>=2.7.0
python-multipart>=0.0.18
```

### Frontend
```
react>=19.0.0
react-dom>=19.0.0
react-router-dom>=7.1.0
axios>=1.7.0
typescript>=5.7.0
@types/react>=19.0.0
vite>=6.0.0
```

---

## 7. Patterns to Follow

1. **Service layer** — routers call services, services call models. Routers handle HTTP concerns (status codes, request parsing), services handle business logic.
2. **Explicit status codes** — `201 Created` for registration, `401 Unauthorized` for bad credentials, `403 Forbidden` for role violations.
3. **Consistent error responses** — Use `HTTPException` with structured detail: `{"detail": "Invalid credentials"}`.
4. **UUID primary keys** — Avoid sequential IDs that leak information.
5. **Soft deletes** — Use `is_active` flag on users; don't hard-delete records.
6. **Index strategy** — Index columns used in WHERE/JOIN: email, isbn, user_id, book_id, status.
