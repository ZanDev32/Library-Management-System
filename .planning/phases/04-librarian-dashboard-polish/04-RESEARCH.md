# Phase 4: Librarian Dashboard & Polish - Research

## Objective
Research the existing codebase and dependencies to plan the Librarian Dashboard, UI Polish, Mobile Responsiveness, and Performance optimization.

## Findings

### 1. Existing Components to Modify
- `LibrarianDashboard.jsx`: Currently has a simple tab layout. Needs to be refactored to a **Sidebar & Widget** layout. The sidebar will show metrics.
- `PendingRequestsTable.jsx` and `ActiveLoansTable.jsx`: Currently display all columns. Need to implement responsive logic (CSS media queries) to hide less important columns on mobile (Hidden Columns strategy).

### 2. Backend Support for Metrics
- Currently, `LibrarianDashboard.jsx` fetches `/api/librarian/requests/all` to get all requests.
- To display summary widgets (Total Pending, Total Active, Total Overdue), we can either compute them on the frontend using the fetched data or create a new dedicated metrics endpoint if performance is an issue.
- Since we fetch all requests anyway, calculating metrics in frontend `useEffect` is sufficient and avoids N+1 queries.

### 3. UI Polish & Aesthetics (Academic Clean)
- We need to establish a consistent color palette in `index.css` or `App.css` if not already present.
- Needs subtle shadows, clear typography, and institution colors (e.g., `#2c3e50` or `#800000`).
- Add micro-animations (e.g., `transition: all 0.3s ease;`) to tabs and buttons.

### 4. Performance (NF01)
- Target: < 2 seconds response.
- React components need to prevent unnecessary re-renders.
- Ensure API queries are fast. If `requests/all` grows large, we might need to add pagination to the backend endpoint, but for this phase, ensuring the UI doesn't block is the priority.

## Validation Architecture
- **Automated Tests:** Verify that the dashboard component renders the sidebar and metrics correctly.
- **Manual UX Testing:** View the dashboard on a mobile viewport (e.g. 375px) to ensure columns hide correctly and horizontal scrolling is minimized.
- **Performance Profiling:** Measure API response time for the dashboard load.
