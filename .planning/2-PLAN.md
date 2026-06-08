# Phase 2 Plan — Book Catalog

## Goal
Deliver a book catalog that students can search and filter, and librarians can manage through CRUD operations.

## Scope
- Search across `title`, `author`, and `ISBN` with relevance-aware matching.
- Filter by `author`, `ISBN`, and availability.
- Show unavailable books in results with clear availability labels.
- Provide librarians with full book CRUD capabilities.
- Keep book deletion limited to the detail page with explicit confirmation.
- Capture full book metadata in add/edit forms.

## Success criteria
- [ ] `GET /books` returns relevant search results for `title`, `author`, and `ISBN`.
- [ ] `available=true` filters to `stock_count > 0` books.
- [ ] Unavailable books still appear in results and are labeled as unavailable.
- [ ] Librarians can create, update, and delete book records.
- [ ] Book deletion is only available from the detail page and requires confirmation.
- [ ] Book data includes `title`, `author`, `ISBN`, `genre`, `publisher`, `publication_year`, and `stock_count`.
- [ ] Students can only read catalog and detail pages; they cannot access write APIs.

## Implementation tasks

### 1. Backend — Book model and DB schema
- [ ] Add `Book` model in `backend/app/models.py` with fields:
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
- [ ] Use `stock_count > 0` to derive availability.
- [ ] Add schema creation or migration logic to create `books` table.

### 2. Backend — Catalog search and filter API
- [ ] Implement `GET /books` in `backend/app/main.py` or a dedicated router.
- [ ] Support query params:
  - `q`
  - `author`
  - `isbn`
  - `available`
  - `page`
  - `page_size`
- [ ] Compose SQLAlchemy queries so:
  - `q` searches `title`, `author`, and `isbn` case-insensitively.
  - `author` and `isbn` filters narrow the result set.
  - `available=true` returns only available books.
- [ ] Return availability metadata and pagination info.

### 3. Backend — Book CRUD API
- [ ] Add `POST /books` for librarians to add books.
- [ ] Add `GET /books/{book_id}` to return full metadata.
- [ ] Add `PUT /books/{book_id}` to update book fields.
- [ ] Add `DELETE /books/{book_id}` to delete a book.
- [ ] Protect write endpoints with `require_librarian` JWT role guard.
- [ ] Ensure students can only use `GET /books` and `GET /books/{book_id}`.

### 4. Frontend — Catalog list and search
- [ ] Build a catalog page with:
  - search input
  - filters for `author`, `ISBN`, and availability
  - paginated results
- [ ] Display each book’s `title`, `author`, `ISBN`, and availability label.
- [ ] Unavailable books should present a visible `Tidak tersedia` badge.
- [ ] Book cards or list items link to a detail page.

### 5. Frontend — Book detail and librarian actions
- [ ] Build a detail page showing complete book metadata.
- [ ] Show `Edit` and `Delete` buttons only to librarians.
- [ ] Add a confirmation dialog before delete.
- [ ] Create `Add Book` and `Edit Book` pages/forms including all metadata fields.
- [ ] Validate required fields and `stock_count` on the frontend.

### 6. Integration and auth alignment
- [ ] Ensure the frontend reads the current user role from JWT and syncs UI controls.
- [ ] Use `frontend/src/api.js` to attach bearer tokens to backend requests.
- [ ] Verify the frontend hides librarian controls for student users.
- [ ] Confirm backend rejects unauthorized CRUD attempts regardless of UI state.

### 7. Testing and verification
- [ ] Add backend tests for search, filter, and CRUD authorization.
- [ ] Add frontend tests for catalog search, availability filter, and book form workflows.
- [ ] Validate end-to-end behavior with a manual verification checklist.

## Verification

### Backend verification
- [ ] `GET /books?q=...` returns relevant books for title/author/ISBN queries.
- [ ] `available=true` returns only books with `stock_count > 0`.
- [ ] `POST/PUT/DELETE /books` require a librarian JWT.
- [ ] `GET /books` still returns unavailable books clearly labeled.

### Frontend verification
- [ ] Catalog page shows searchable book list with availability badges.
- [ ] Availability filter narrows results correctly.
- [ ] Book detail pages are accessible to all users.
- [ ] Librarian-only controls appear only for librarians.
- [ ] Add/Edit book flows preserve the full metadata schema.

## Notes
- Build Phase 2 on the Phase 1 auth foundation; do not introduce new auth or database stacks.
- Keep advanced search enhancements (e.g. `pg_trgm`) as a follow-on improvement if initial `ILIKE` search is sufficient.
- This plan is executable with the existing FastAPI + React + PostgreSQL architecture.
