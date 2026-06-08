# Phase 2 Research — Book Catalog

## Purpose
Validasi pendekatan teknis untuk fitur katalog buku dan CRUD pustakawan yang akan dieksekusi di Phase 2.

## Inputs
- `.planning/2-CONTEXT.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`

## Current state
- Backend auth foundation dan database setup Phase 1 sudah terdefinisi.
- Phase 2 fokus pada katalog buku: pencarian, filter, tampilan, dan CRUD pustakawan.
- Tidak ada kode spesifik katalog buku saat ini di backend atau frontend.

## Key findings

### Search and filter strategy
- Search harus mendukung `title`, `author`, dan `ISBN`.
- Early implementation should use PostgreSQL-friendly search with SQLAlchemy query composition:
  - `q` performs a broad case-insensitive token search across `title`, `author`, and `isbn`.
  - `author` and `isbn` support dedicated exact or partial matching.
  - `available` filters by `stock_count > 0`.
- For relevance, prefer:
  - simple `ILIKE`/`lower()` matching first, with `title`/`author` boosts on query term hits.
  - optional later upgrade to `pg_trgm`/full-text if accuracy becomes a problem.
- Default result set should include unavailable books, but unavailable items must be clearly labeled.

### Book model and availability
- Required metadata:
  - `id`
  - `title`
  - `author`
  - `isbn`
  - `genre`
  - `publisher`
  - `publication_year`
  - `stock_count`
  - `created_at`
  - `updated_at`
- Availability should be derived from `stock_count > 0` and surfaced as a status label.
- The model should enforce unique `isbn` if possible, but keep data validation flexible enough for legacy records.

### Librarian CRUD and role enforcement
- CRUD endpoints need JWT auth and a `librarian` role guard.
- Student users should only access read routes: catalog list and book detail.
- Delete should be available only from detail view and require explicit confirmation in UI.

### Frontend UX implications
- Catalog page should combine search and filter controls in a single view.
- Book list should show `title`, `author`, `ISBN`, and availability badge.
- Detail page should display all metadata and render management controls only for librarians.
- Add/Edit book forms should capture the full metadata set and preserve `stock_count` semantics.

## Recommendation
1. Define a `Book` SQLAlchemy model and create/update the PostgreSQL schema.
2. Implement a backend `GET /books` endpoint with query parameters:
   - `q`
   - `author`
   - `isbn`
   - `available`
   - `page`
   - `page_size`
3. Implement book CRUD endpoints with librarian-only write access:
   - `POST /books`
   - `GET /books/{book_id}`
   - `PUT /books/{book_id}`
   - `DELETE /books/{book_id}`
4. Add frontend pages: catalog list, book detail, add book, edit book.
5. Ensure UI reflects the current user role from JWT and hides management controls for students.
6. Add backend and frontend verification tests around search, filter, availability, and role-based authorization.

## Risks and mitigation
- `pg_trgm` may not be available in all PostgreSQL environments; implement a working `ILIKE` fallback first.
- Search relevance can be fragile; define explicit ordering rules and keep the first iteration simple.
- Book deletion must be guarded both in UI and backend to avoid accidental catalog loss.

## Decision
Use a staged implementation:
- Phase 2 delivers a reliable search/filter/catalog feature set with explicit availability labels and librarian CRUD.
- Defer advanced ranking and full-text search enhancements to a later phase if needed.
