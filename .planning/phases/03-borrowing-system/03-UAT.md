---
status: complete
phase: 03-borrowing-system
source:
  - 03-01-SUMMARY.md
  - 03-02-SUMMARY.md
  - 03-03-SUMMARY.md
started: "2026-06-08T16:17:00.000Z"
updated: "2026-06-08T16:17:45.000Z"
---

## Current Test

[testing complete]

## Tests

### 1. Submit Borrow Request
expected: POST /api/borrow/request with {"book_id": 10} returns 200 with message "Borrow request submitted" and a request_id.
result: pass

### 2. Join Waitlist
expected: POST /api/borrow/waitlist with {"book_id": 10} returns 200 with message "Added to waitlist" and a waitlist_id.
result: pass

### 3. Librarian Batch Approve
expected: POST /api/librarian/requests/process with action "APPROVE" returns success, sets status to APPROVED, due_date to +14 days, and pickup_deadline to +2 days.
result: pass

### 4. Librarian Reject (requires reason)
expected: POST /api/librarian/requests/process with action "REJECT" without reason returns error "Reason is required for rejection". With reason provided, returns success.
result: pass

### 5. Return Book via Scan
expected: POST /api/librarian/requests/returns/scan with a PICKED_UP loan_id returns 200 with "Book returned successfully" and days_late=0 (if returned on time).
result: pass

### 6. Mark Book as Picked Up
expected: POST /api/librarian/requests/{loan_id}/pickup with an APPROVED loan returns 200 with "Book marked as picked up".
result: pass

### 7. Request Extension
expected: POST /api/borrow/extend with an active loan_id returns 200 with "Extension request submitted" and an extension_id.
result: skipped
reason: Extension endpoint exists but no dedicated test in test suite — verified via code review.

### 8. Overdue Detection Job
expected: Running check_and_send_reminders cancels loans past pickup_deadline and sends notifications for due-tomorrow, due-today, and 3-days-overdue loans.
result: pass

### 9. Database Models Integrity
expected: BorrowRequest, Waitlist, and ExtensionRequest models can be instantiated with correct defaults (PENDING/WAITING status) and persisted to the database.
result: pass

## Summary

total: 9
passed: 8
issues: 0
pending: 0
skipped: 1

## Gaps

[none]
