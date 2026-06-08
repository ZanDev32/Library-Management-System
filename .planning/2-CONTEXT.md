# Phase 2 Context — Book Catalog

## Phase
- Phase: 2
- Name: Book Catalog
- Goal: Build the catalog search and display experience, plus librarian book management CRUD.

## Locked decisions for downstream research and planning

1. Search behavior
   - Use a relevance-driven search model rather than exact keyword-only matching.
   - Support fuzzy / smart matching across `title`, `author`, and `ISBN`.
   - Search should return the most relevant books first.

2. Filters
   - Provide filters for `title`, `author`, `ISBN`, and `availability`.
   - Availability filter should allow users to narrow results to currently available books.

3. Result set behavior
   - Display all matching books by default, including currently unavailable ones.
   - Clearly label unavailable books with an availability status indicator.
   - Default ordering should emphasize relevance to the search query.

4. Librarian book CRUD
   - Provide a structured add/edit workflow for librarians with full metadata fields:
     `title`, `author`, `ISBN`, `genre`, `publisher`, `publication_year`, and `stock_count`.
   - Manage availability with both `stock_count` and an explicit availability label.
   - Delete actions should be available from the book detail view, not directly from the list.
   - Use a standard form-based add/edit experience rather than an inline or modal-only workflow.

## Notes for downstream agents

- `gsd-phase-researcher` should inspect the current codebase for any existing search or query utilities, database text search support, and UI patterns for filter controls and result labels.
- `gsd-planner` should treat this phase as focused on search/filter/display/CRUD only, with no new catalog capabilities beyond the roadmap scope.

## Prior context

- No prior phase-specific CONTEXT.md exists.
- Project-level decisions from `.planning/PROJECT.md` and `.planning/REQUIREMENTS.md` remain in force: FastAPI backend, React frontend, PostgreSQL database, JWT auth, student/librarian roles.

## Deferred ideas

- Photo-based book creation: menambahkan buku dengan mengambil foto sampul/metadata buku.
- Fokus tetap pada manajemen katalog buku standar di Phase 2.
