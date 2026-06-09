# Phase 1 — Plan 2: Database Schema & Migrations

**Requirements:** Foundation (enables F01, F02, F03, F04, F05)
**Depends on:** Plan 1 (scaffold must exist)
**Parallelizable:** Yes (can run alongside Plan 3 after Plan 1)

## Goal

Define SQLAlchemy models for users, books, and borrow_records. Set up Alembic for migration management. Run the initial migration creating all tables. After this plan, the database has a working schema that later phases plug into.

## Context

From `01-CONTEXT.md`:
- Layered backend: `models/` directory holds SQLAlchemy models
- Students self-register (role enum: student/librarian)
- Schema covers three core entities now (users, books, borrow_records)

From `01-RESEARCH.md` §2:
- Async SQLAlchemy with `asyncpg` driver
- UUID primary keys
- Alembic for migrations

## Tasks

### Task 2.1: Database connection setup
- `backend/app/core/database.py`:
  - `create_async_engine(settings.DATABASE_URL)`
### Task 2.1: Database connection setup
- `backend/app/core/database.py`:
  - `create_async_engine(settings.DATABASE_URL)` with connection pooling tuned for performance (NF01): `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`, `pool_recycle=1800`
  - `AsyncSessionLocal` via `async_sessionmaker`
  - `Base = declarative_base()`
  - `get_db()` async generator dependency

### Task 2.2: User model
- `backend/app/models/user.py`:
  - `id`: UUID, primary_key, default=uuid4
  - `email`: String(255), unique, indexed, not null
  - `hashed_password`: String(255), not null
  - `full_name`: String(100), not null
  - `role`: Enum('student', 'librarian'), default='student'
  - `is_active`: Boolean, default=True
  - `created_at`: DateTime, server_default=func.now()
  - `updated_at`: DateTime, onupdate=func.now()
  - Relationship: `borrow_records` back_populates

### Task 2.3: Book model
- `backend/app/models/book.py`:
  - `id`: UUID, primary_key
  - `title`: String(300), indexed, not null
  - `author`: String(200), indexed, not null
  - `isbn`: String(20), unique, indexed, not null
  - `publisher`: String(200), nullable
  - `year`: Integer, nullable
  - `quantity`: Integer, default=1
  - `available_quantity`: Integer, default=1
  - `created_at`, `updated_at`
  - Relationship: `borrow_records` back_populates

### Task 2.4: BorrowRecord model
- `backend/app/models/borrow.py`:
  - `id`: UUID, primary_key
  - `user_id`: ForeignKey(users.id), indexed
  - `book_id`: ForeignKey(books.id), indexed
  - `status`: Enum('pending','approved','rejected','returned','overdue'), default='pending'
  - `borrow_date`: DateTime, nullable
  - `due_date`: DateTime, nullable
  - `return_date`: DateTime, nullable
  - `created_at`, `updated_at`
  - Relationships: `user`, `book`

### Task 2.5: Alembic initialization
- Run `alembic init alembic` inside `backend/`
- Configure `alembic.ini` to read `DATABASE_URL` from env
- Update `alembic/env.py`:
  - Import `Base.metadata` from models
  - Set `target_metadata = Base.metadata`
  - Use sync engine for migrations (standard for Alembic)
- Create initial migration: `alembic revision --autogenerate -m "initial schema"`

### Task 2.6: Models package init
- `backend/app/models/__init__.py`: import all models so Base.metadata collects them
- Ensure models are imported before Alembic reads metadata

## Verification

- [ ] `docker compose exec backend alembic upgrade head` runs without errors
- [ ] All three tables created: `users`, `books`, `borrow_records`
- [ ] Columns and constraints match the model definitions
- [ ] Foreign keys exist between borrow_records → users, borrow_records → books
- [ ] Indexes created on email, isbn, user_id, book_id, status
- [ ] Connection pool is configured (pool_size/max_overflow set) — supports NF01 under concurrent load

## Definition of Done

Database schema is live and matches models. Alembic tracks migrations. New models can be added and migrated in future phases.
