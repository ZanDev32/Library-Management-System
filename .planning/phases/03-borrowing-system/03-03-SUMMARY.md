# Phase 3-03: Backend APIs for Returns & Overdue Jobs

## Tasks Completed
- [x] Create Return Scan Endpoint (Librarian)
- [x] Create Overdue Detection & Reminder Job
- [x] Add `PICKED_UP` State Endpoint (Librarian)
- [x] Create Extension Request Endpoint (Student)

## Notes
- Return scan logic automatically calculates `days_late`.
- Pickup endpoint created to handle transitioning a loan from `APPROVED` to `PICKED_UP`.
- Overdue job loops through active loans and correctly triggers notifications based on due date.
- Extension endpoint allows students to request an extension for active loans.
- Code coverage is complete for backend features.
