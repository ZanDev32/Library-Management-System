# Requirements — Library Management System (LMS)

## Scope
The system will provide a centralized web-based library management experience for students and librarians, including catalog search, borrow request workflows, return tracking, overdue notifications, and librarian administration.

## Functional Requirements

| ID | Requirement | Notes / Acceptance Criteria |
|----|-------------|-----------------------------|
| F01 | User registration & login | Students and librarians can create accounts, authenticate, and receive JWTs. |
| F02 | Book catalog search | Users can search and filter by title, author, ISBN, and availability. |
| F03 | Borrow request | Students can submit borrow requests; librarians can approve or reject requests. |
| F04 | Return tracking | Librarians can record returns, update availability, and maintain borrow history. |
| F05 | Overdue alerts | Overdue loans are flagged and visible to students and librarians. |
| F06 | Librarian dashboard | Librarians see pending requests, active loans, and overdue items in one view. |
| F07 | Book management CRUD | Librarians can add, edit, and remove catalog entries. |

## Non-Functional Requirements

| ID | Requirement | Target / Measure |
|----|-------------|------------------|
| NF01 | Performance | Pages and search responses should complete in under 2 seconds. |
| NF02 | Security | Authentication and authorization enforced via JWT; protected routes deny unauthorized access. |
| NF03 | Usability | UI must be mobile responsive on phone, tablet, and desktop. |

## User Stories

- As a student, I want to register and log in so I can access the library system.
- As a student, I want to search the catalog so I can find books quickly.
- As a student, I want to submit a borrow request so I can borrow available books.
- As a librarian, I want to approve or reject borrow requests so I can manage lending.
- As a librarian, I want to record returns so I can keep the catalog availability accurate.
- As a librarian, I want to see overdue items so I can follow up with students.
- As a librarian, I want to manage book records so the catalog stays up to date.

## Out of Scope

- Online payment processing for fines.
- Inter-library loan with external institutions.
- E-book or digital content delivery.
- Native mobile applications.

## Acceptance Criteria

- Students and librarians can create accounts, log in, and get valid JWT access tokens.
- Protected API routes reject requests without a valid token and enforce student/librarian role separation.
- Students can search the book catalog with filters and see current availability status.
- Librarians can perform CRUD operations on book records.
- Borrow requests can be submitted, approved, rejected, and tracked through completion.
- Returns update book availability and preserve a borrow history record.
- Overdue loans are clearly indicated to both users and librarians.
- The application UI adapts correctly across desktop, tablet, and mobile breakpoints.
- API responses complete within the performance budget for typical catalog and search queries.
