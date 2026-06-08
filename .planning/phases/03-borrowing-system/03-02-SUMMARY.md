# Phase 3-02: Backend APIs for Borrow & Approve

## Tasks Completed
- [x] Create Borrow Request Endpoint (Student)
- [x] Create Waitlist Endpoint (Student)
- [x] Create Approve/Reject Endpoint (Librarian)
- [x] Implement Notification Service Stub

## Notes
- `BorrowRequestIn` schema defined.
- Stub for dependencies created in `backend/app/api/deps.py` to allow isolated API testing.
- `send_status_update_notification` prints to console for MVP.
- All endpoints tested via `tests/api/test_borrowing.py` and pass verification.
