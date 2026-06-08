# Project Specification

## Project Name

Library Management System (LMS) for Universitas XYZ

## Problem Statement

The library at Universitas XYZ still manages book lending with paper logs and spreadsheets. Students cannot check availability without visiting the desk, librarians spend hours reconciling borrow/return records, and overdue books go untracked. The institution needs a centralized web system to search the catalog, request borrows online, and let librarians manage the collection efficiently.

## Target Users

- **Students** — Search and browse the book catalog, submit borrow requests, view their borrowed items and due dates, receive overdue notifications.
- **Librarians** — Manage the book catalog (add/edit/remove titles), approve or reject borrow requests, track returns, and monitor overdue items via a dashboard.

## Key Features

| F-ID | Feature | Description |
|------|---------|-------------|
| F01  | User registration & login | Students and librarians create accounts and authenticate into the system. |
| F02  | Book catalog search | Search and filter the catalog by title, author, ISBN, and availability. |
| F03  | Borrow request | Students submit borrow requests; librarians approve or reject them. |
| F04  | Return tracking | Record book returns and update availability and borrow history. |
| F05  | Overdue alerts | Notify students and librarians of items past their due date. |
| F06  | Librarian dashboard | Central view of pending requests, active loans, and overdue items. |
| F07  | Book management CRUD | Librarians create, read, update, and delete catalog entries. |

## Non-Functional Requirements

| NF-ID | Requirement | Target / Measure |
|-------|-------------|------------------|
| NF01  | Performance | Page and search responses complete in under 2 seconds. |
| NF02  | Security | Authentication and authorization enforced via JWT. |
| NF03  | Usability | Fully mobile responsive across phone, tablet, and desktop. |

## Out of Scope

- Payment processing for fines (tracking only, no online payment).
- Inter-library loan with other institutions.
- E-book / digital content delivery.
- Native mobile apps (web responsive only).

## Tech Stack Hints

- **Backend:** FastAPI (Python)
- **Frontend:** React
- **Database:** PostgreSQL
- **Infra:** Docker (containerized services)

## Constraints

- Academic project timeline: deliverable across 4 phases.
- Must run on the university's existing Docker-capable server infrastructure.
- Single team; limited maintenance budget after handover.
