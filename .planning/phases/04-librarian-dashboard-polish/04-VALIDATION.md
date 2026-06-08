# Phase 4 Validation Strategy

**Phase:** 04-librarian-dashboard-polish
**Date:** 2026-06-08

## 1. Unit & Integration Tests (Automated)
- Ensure the frontend build passes without warnings or errors.
- Ensure any added metrics calculation logic works correctly given mock data.

## 2. End-to-End User Flow (Manual / UAT)
- [ ] Open Librarian Dashboard and verify the Sidebar & Widget layout renders correctly.
- [ ] Check that metrics (Total Pending, Active, Overdue) calculate accurately based on the data.
- [ ] Resize the browser window to mobile width (< 768px) and verify that "Hidden Columns" are applied to the tables.
- [ ] Ensure buttons and tabs have smooth micro-animations on hover/click.
- [ ] Verify the page loads within 2 seconds.

## 3. Security & Boundary Checks
- Ensure the dashboard endpoints remain protected and inaccessible to `student` roles.
