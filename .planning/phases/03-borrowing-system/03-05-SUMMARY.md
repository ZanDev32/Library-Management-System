# Phase 3-05: Frontend Librarian UI

## Tasks Completed
- [x] Create Librarian Borrow Dashboard (`LibrarianDashboard.jsx`)
- [x] Implement Batch Approve/Reject UI (`PendingRequestsTable.jsx`)
- [x] Implement QR Scanner Component (`QRScanner.jsx`)
- [x] Implement Pickup Marker (`ActiveLoansTable.jsx`)

## Notes
- Librarian dashboard handles switching between Pending, Active, and Scanner tabs.
- PendingRequestsTable supports multiple selection and batch processing for APPROVE/REJECT, including requiring a reason for REJECT.
- ActiveLoansTable handles marking an APPROVED loan as PICKED_UP.
- QRScanner handles return scans simulating reading a barcode/QR to update the system.
