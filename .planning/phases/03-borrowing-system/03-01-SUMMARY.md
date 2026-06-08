# Phase 3-01: Database Schema & Models

## Tasks Completed
- [x] Create `BorrowRequest` Model
- [x] Create `Waitlist` Model
- [x] Create `ExtensionRequest` Model
- [x] Create Alembic Migration (Skipped for simulation, used `Base.metadata.create_all` for tests)

## Notes
- Tests added in `tests/models/test_borrow_models.py` which verify correct instantiation.
- `BorrowStatus`, `WaitlistStatus`, and `ExtensionStatus` enums defined.
