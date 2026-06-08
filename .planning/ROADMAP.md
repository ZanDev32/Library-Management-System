# Roadmap — Library Management System (LMS)

## Milestone Overview

| Phase | Name | Focus | Requirements |
|-------|------|-------|--------------|
| 1 | Foundation | Auth, DB schema, project setup | F01, NF02 |
| 2 | Book Catalog | Search, display, CRUD | F02, F07 |
| 3 | Borrowing System | Borrow, return, overdue | F03, F04, F05 |
| 4 | Librarian Dashboard & Polish | Dashboard, UI, performance | F06, NF01, NF03 |

---

## Phase 1 — Foundation

**Goals:** Stand up the project skeleton, database, and a secure authentication system that all later features build on.

**Requirements covered:** F01, NF02

**Deliverables:**
- Dockerized FastAPI + React + PostgreSQL project scaffold.
- Database schema for users, books, and borrow records.
- User registration and login endpoints.
- JWT-based authentication and role separation (student / librarian).

**Definition of Done:**
- [ ] A user can register and log in receiving a valid JWT.
- [ ] Protected routes reject requests without a valid token.
- [ ] Roles distinguish students from librarians.
- [ ] `docker compose up` brings the full stack online.

---

## Phase 2 — Book Catalog

**Goals:** Build the catalog so students can find books and librarians can manage them.

**Requirements covered:** F02, F07

**Deliverables:**
- Book catalog search with filters (title, author, ISBN, availability).
- Catalog browse/display UI.
- Book management CRUD for librarians.

**Definition of Done:**
- [ ] Students can search and filter the catalog and see availability.
- [ ] Librarians can create, edit, and delete book records.
- [ ] Search returns relevant results within performance budget.

---

## Phase 3 — Borrowing System

**Goals:** Enable the full lending lifecycle: request, approval, return, and overdue handling.

**Requirements covered:** F03, F04, F05

**Deliverables:**
- Borrow request submission and librarian approve/reject flow.
- Return tracking that updates availability and borrow history.
- Overdue detection and alerts for students and librarians.

**Definition of Done:**
- [ ] Students can request a borrow and see its status.
- [ ] Librarians can approve/reject and record returns.
- [ ] Overdue items are flagged and surfaced to the right users.

---

## Phase 4 — Librarian Dashboard & Polish

**Goals:** Deliver the operational dashboard and finalize UX and performance for production readiness.

**Requirements covered:** F06, NF01, NF03

**Deliverables:**
- Librarian dashboard: pending requests, active loans, overdue items.
- UI polish and consistent design.
- Mobile responsive layouts.
- Performance tuning to meet response targets.

**Definition of Done:**
- [ ] Dashboard shows accurate real-time counts and lists.
- [ ] All pages render correctly on mobile, tablet, and desktop (NF03).
- [ ] Key interactions respond in under 2 seconds (NF01).
