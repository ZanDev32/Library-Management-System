# Phase 3: Borrowing System - Research

## Architectural Approach & Constraints

- **Backend:** FastAPI (Python)
- **Frontend:** React
- **Database:** PostgreSQL (with SQLAlchemy or similar ORM)
- **Authentication:** JWT-based, separating `student` and `librarian` roles (from Phase 1).

## Data Model Requirements

To support the borrowing system described in CONTEXT.md, we need the following entities and fields:

1.  **BorrowRequest (or Loan)**
    -   `id`: Primary key (UUID/Integer)
    -   `user_id`: Foreign key to Student (User)
    -   `book_id`: Foreign key to Book
    -   `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `RETURNED`, `CANCELLED`)
    -   `request_date`: Timestamp
    -   `approval_date`: Timestamp (nullable)
    -   `due_date`: Timestamp (nullable) - set to `approval_date` + 14 days.
    -   `return_date`: Timestamp (nullable)
    -   `rejection_reason`: String/Text (nullable, but required if status is `REJECTED`)
    -   `pickup_deadline`: Timestamp (nullable) - set to `approval_date` + 2 days.

2.  **Waitlist**
    -   `id`: Primary key
    -   `user_id`: Foreign key to Student
    -   `book_id`: Foreign key to Book
    -   `request_date`: Timestamp
    -   `status`: Enum (`WAITING`, `FULFILLED`, `CANCELLED`)

3.  **ExtensionRequest**
    -   `id`: Primary key
    -   `loan_id`: Foreign key to BorrowRequest
    -   `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
    -   `request_date`: Timestamp

## Feature Implementation Strategies

### 1. Alur Permintaan Pinjam (Student)
-   **Frontend:** Create a 2-step modal or dedicated page for borrowing. Step 1: Click "Pinjam". Step 2: Show confirmation details (estimated due date, etc.) and submit button.
-   **Waitlist Handling:** When a book has `available_copies == 0`, the "Pinjam" button should change to "Masuk Antrian" (Waitlist). The backend needs an endpoint to add a user to the waitlist for a specific book.
-   **No Borrow Limit:** The backend will not enforce a maximum number of active loans per user.

### 2. Approve/Reject (Librarian)
-   **Batch Processing:** The frontend librarian dashboard needs a table view with checkboxes for batch approval/rejection.
-   **Backend Endpoints:**
    -   `POST /api/librarian/requests/approve` (accepts a list of request IDs)
    -   `POST /api/librarian/requests/reject` (accepts a list of request IDs and a mandatory `reason` string)
-   **Notifications:** We need a notification service. Since email is required (D-07), we should integrate an email sender (e.g., `aiosmtpd` for local dev/testing, or an external provider mock). We also need a database table for `Notifications` to show in-app alerts.
-   **Pickup Deadline:** When approving, set `pickup_deadline` to Now + 2 days. A background task or cron job (e.g., using APScheduler or Celery/Redis, though APScheduler or simple background tasks in FastAPI might suffice for MVP) is needed to auto-cancel approved requests that pass the deadline.

### 3. Pengembalian Buku (Return)
-   **QR/Barcode Scanner:** The React frontend can use a library like `react-qr-reader` or `html5-qrcode` to access the device camera and scan QR codes.
-   **QR Content:** The QR code displayed on the student's app should ideally encode the `BorrowRequest.id` or a secure token representing the active loan.
-   **Backend Endpoint:** `POST /api/librarian/returns/scan` receiving the scanned code. It updates the `return_date`, calculates `days_late = max(0, return_date - due_date)`, and increments the book's `available_copies`.
-   **Extensions:** Students can submit an `ExtensionRequest`. Librarians review and approve/reject. If approved, `due_date` is pushed back (e.g., +7 or +14 days).

### 4. Keterlambatan & Notifikasi
-   **Default Loan Period:** 14 days from approval.
-   **Reminder Pattern:**
    -   H-1 (1 day before due)
    -   H (Day of due)
    -   H+3 (3 days late)
-   **Implementation:** This strongly necessitates a scheduled background job. A daily script (e.g., running at midnight) that queries the database for loans matching the criteria and generates notifications/emails. FastAPI `BackgroundTasks` are per-request, so we need a persistent scheduler like `APScheduler` or a standalone cron job calling a FastAPI management endpoint.

## Third-Party Libraries & Tooling Needed
-   **Backend:**
    -   `fastapi-mail` or similar for email sending.
    -   `APScheduler` for running the daily overdue checks and pickup deadline cancellations.
-   **Frontend:**
    -   `html5-qrcode` or `react-qr-reader` for the librarian's scanner UI.
    -   `qrcode.react` to generate QR codes on the student's screen showing their loan ID.

## Risks & Edge Cases
-   **Concurrency:** If two students try to borrow the last available copy simultaneously, database transactions (row locks or atomic updates) must ensure `available_copies` doesn't drop below 0.
-   **Email Delivery Failure:** If the email server is down, the status update (approve/reject) should still succeed, perhaps queueing the email for later retry.
-   **Waitlist Fulfillment:** When a book is returned, the system needs to notify the first person on the waitlist. Should it auto-approve them, or just notify them to claim it? (Assumption: Notify them to claim it, or auto-create a pending borrow request for them).

## Validation Architecture
-   **API Tests:** Pytest verifying state transitions (Pending -> Approved -> Returned).
-   **Constraint Tests:** Verify rejection without a reason fails. Verify borrowing a book with 0 copies fails (or goes to waitlist).
-   **Job Tests:** Manually trigger the overdue cron job in tests and verify notifications are created.
