# Merge / Rebase Plan: `Fauzan` ↔ `refah`

**Date:** 2026-06-09
**Author:** Fauzan branch analysis
**Status:** Decision required before any merge

## TL;DR

`Fauzan` and `refah` are **two independent, architecturally incompatible
foundations** — not incremental work on a shared base. A `git rebase` or
`git merge` between them would conflict in nearly every file and cannot be
auto-resolved (JavaScript vs TypeScript alone blocks it).

**This is a "pick one foundation" decision, not a merge.**

## Architectural Comparison

| Aspect | `Fauzan` (this branch) | `refah` |
|--------|------------------------|---------|
| Frontend language | **TypeScript** (`.tsx`) | **JavaScript** (`.jsx`) |
| Backend layout | Layered: `core/`, `models/`, `schemas/`, `routers/`, `services/` | Flat: `auth.py`, `crud.py`, `database.py`, `models.py` |
| User PK | **UUID** | **Integer** |
| User fields | `full_name`, `is_active`, role **enum** | `name`, role **string** |
| Book fields | `quantity` + `available_quantity` | `stock_count` + `available` (computed) |
| Book extras | — | `genre`, `updated_at` |
| Migrations | **Alembic** (versioned) | `create_all` (no migrations) |
| Auth tokens | Access + **refresh** (httpOnly cookie) | Access token only |
| Login contract | JSON body | OAuth2 form (`username`/`password`) |
| `/me` route | `/auth/me` | `/users/me` |
| Frontend→API | **Vite proxy** (`/api`) | Direct `VITE_BACKEND_URL` |
| Postgres | **18-alpine** | **15** |
| bcrypt pin | `==4.0.1` | `<4` |
| DB auto-create | No (expects existing DB) | Yes (`ensure_database_exists`) |
| **Phase 2 (Catalog)** | ❌ Not built | ✅ CRUD + search + pagination |

## Why a Rebase Won't Work

1. **Language mismatch** — `refah` is `.jsx`, `Fauzan` is `.tsx`. Git sees these
   as unrelated files (different paths) → every frontend file is add/delete, not
   a 3-way merge.
2. **Backend structure mismatch** — `refah`'s flat `app/*.py` vs `Fauzan`'s
   `app/core/`, `app/routers/` etc. No file aligns for a content merge.
3. **Data model divergence** — Integer vs UUID PK is a schema-breaking
   difference. Cannot coexist; one must be dropped.
4. **No common Phase 1 commit** — both branched from the empty "First Commit",
   so there is no shared baseline to rebase against meaningfully.

## Branch Lineage (Verified)

```
"First Commit" (be35a1b)
├── Fauzan          (TS, layered backend, Phase 1 complete)
├── refah           (JS, flat backend, Phase 1+2 complete)
├── feature/phase-03-borrowing-system  (docs only, no code)
│   └── feature/phase-04-dashboard-polish  (Phases 3+4 incremental files)
├── Alika           (no commits beyond main)
└── Dzaboy739       (no commits beyond main)
```

**Key finding:** ALL branches fork independently from the empty "First Commit".
Phase-04 does NOT descend from `refah` OR `Fauzan`. It only has *incremental*
Phase 3-4 files (`app/api/endpoints/`, `app/models/borrow.py`,
`app/services/notification.py`, frontend `.jsx` components) — no foundation of
its own. It expects to be layered on top of *some* Phase 1+2 base.

Phase-04 conventions:
- Backend: **layered** (`app/api/`, `app/models/`, `app/services/`) → matches `Fauzan`
- Frontend: **`.jsx`** (JavaScript) → matches `refah`
- No Alembic, no migrations, no full auth or DB setup

## The Real Decision

Pick the foundation, then adapt Phase-04's incremental files onto it.
Since Phase-04 doesn't commit to either base, the choice is **free** — both
paths require adaptation of Phase-04 code.

## Recommended Paths

Since Phase-04 doesn't descend from either base, the decision is **free** —
both paths require roughly equal adaptation of Phase-04's incremental files.

### Option A — Adopt `Fauzan` as foundation ⭐ RECOMMENDED
**Why:** Better engineering quality (TS, Alembic, refresh tokens, layered
backend). Phase-04's backend structure already matches `Fauzan`'s layered
layout (`app/api/`, `app/models/`, `app/services/`).

Steps:
1. Merge PR #2 (`Fauzan`) → `main`. **Phase 1 done.**
2. Port `refah`'s Phase 2 Book Catalog to TS + layered structure (~half day).
3. Port Phase-04's borrowing endpoints + frontend pages to TS (~1 day).
4. Port Phase-04's dashboard pages to TS (~half day).
5. Done — full 4-phase stack on a solid typed foundation.

Effort: ~2 days total porting.
Benefit: Type safety, Alembic migrations, secure auth, clean architecture.

### Option B — Adopt `refah` as foundation
**Why:** Already has Phase 2 working out of the box; less porting if team
is comfortable with JavaScript.

Steps:
1. Merge `refah` → `main`. **Phase 1+2 done.**
2. Close PR #2 or extract Alembic/refresh-token improvements.
3. Port Phase-04's incremental files onto `refah`'s flat backend (~need
   to restructure `app/api/` → flat `app/` pattern or adopt layered).
4. Add Phase-04's frontend pages (already `.jsx`, should drop in easily).

Effort: ~1 day porting (mainly backend restructure for Phase 3-4 files).
Risk: No migrations, no type safety, access-token-only auth is weaker.

### Option C — Hybrid (pragmatic if deadline is tight)
Use `refah` for speed (Phase 1+2 already done), then incrementally add:
- Alembic migrations from `Fauzan`
- Refresh token auth from `Fauzan`
- TypeScript migration later (tech debt ticket)

Steps:
1. Merge `refah` → `main`.
2. Cherry-pick Alembic setup + refresh token from `Fauzan` as follow-up PR.
3. Drop in Phase-04's frontend `.jsx` pages (compatible).
4. Adapt Phase-04's backend endpoints to flat structure.

Effort: ~1 day. Leaves TS migration as future tech debt.

## Salvage List (valuable bits from `Fauzan` regardless of choice)

- **Alembic migrations** — `refah` has none; versioned migrations are worth
  keeping for any production path.
- **Refresh-token + httpOnly cookie** auth — more secure than `refah`'s
  access-only.
- **Vite proxy pattern** — avoids exposing backend port / CORS issues.
- **Postgres 18 + bcrypt pin fixes** — already debugged and working.
- **TypeScript types** — if team goes TS.

## Recommendation

**Lead with Option A** (adopt `refah`) *if and only if* Phases 3-4 are built on
its conventions — that minimizes rewrite. Fold in the `Fauzan` salvage items
(especially Alembic + refresh tokens) as follow-up improvements.

If the team values type-safety and migration discipline over speed, Option B is
defensible but costs a Phase 2-4 rewrite.

## Immediate Next Step

Verify which foundation `feature/phase-04-dashboard-polish` was built on:

```bash
git show origin/feature/phase-04-dashboard-polish:backend/app/main.py | head
git ls-tree origin/feature/phase-04-dashboard-polish frontend/src/
```

That answer determines whether Option A or B is the low-cost path.

## Decision Log

| Question | Answer | Decided by |
|----------|--------|------------|
| Which foundation wins? | _pending_ | team |
| Keep Alembic? | recommend yes | _pending_ |
| TS or JS frontend? | _pending_ | team |
