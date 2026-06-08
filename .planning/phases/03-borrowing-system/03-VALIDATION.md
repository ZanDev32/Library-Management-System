---
phase: 3
slug: borrowing-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-08
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (Backend), vitest/jest (Frontend) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `pytest tests/api/test_borrowing.py` / `npm run test` |
| **Full suite command** | `pytest` / `npm run test:all` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command for specific module.
- **After every plan wave:** Run full suite command.
- **Before `/gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | F03 | — | N/A | unit | `pytest tests/api/test_borrowing.py` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | F03 | — | N/A | e2e | `npm run test -- borrow_request` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | F03 | — | Reject requires reason | unit | `pytest tests/api/test_librarian.py` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 3 | F04 | — | N/A | unit | `pytest tests/api/test_returns.py` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 4 | F05 | — | N/A | unit | `pytest tests/jobs/test_overdue.py` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/api/test_borrowing.py` — stubs for F03
- [ ] `tests/api/test_librarian.py` — stubs for F03
- [ ] `tests/api/test_returns.py` — stubs for F04
- [ ] `tests/jobs/test_overdue.py` — stubs for F05
- [ ] Backend test infrastructure (pytest) setup if not present
- [ ] Frontend test infrastructure setup if not present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| QR Code Scanning | F04 | Requires physical camera/device | Buka app via device mobile/webcam, tunjukkan QR test, pastikan terbaca oleh scanner pustakawan. |
| Email Delivery | F05 | External service | Periksa inbox (mailtrap/lokal) untuk memastikan email reminder H-1, H, H+3 masuk. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
