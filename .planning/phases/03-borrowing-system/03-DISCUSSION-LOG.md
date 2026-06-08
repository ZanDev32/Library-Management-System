# Phase 3: Borrowing System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 3-Borrowing System
**Areas discussed:** Alur permintaan pinjam, Approve/Reject oleh Pustakawan, Pengembalian Buku, Deteksi & Notifikasi Keterlambatan

---

## Alur permintaan pinjam

| Option | Description | Selected |
|--------|-------------|----------|
| Q1: Alur mahasiswa | 1 langkah, 2 langkah, atau serahkan ke agent? | 2 langkah |
| Q2: Batas maksimal buku | 3 buku, 5 buku, tidak dibatasi, atau serahkan ke agent? | Tidak dibatasi |
| Q3: Jika tidak tersedia | Tombol disabled, bisa antri (waitlist), atau serahkan ke agent? | Bisa antri (waitlist) |
| Q4: Status mahasiswa | 3 status, 5 status, atau serahkan ke agent? | 3 status |

**Notes:** User secara spesifik memilih opsi untuk membatasi lewat approve/reject dan mengizinkan adanya waitlist jika buku kosong.

---

## Approve/Reject oleh Pustakawan

| Option | Description | Selected |
|--------|-------------|----------|
| Q1: Proses persetujuan | Satu per satu, batch, keduanya, atau serahkan ke agent? | Keduanya |
| Q2: Alasan penolakan | Wajib, opsional, tidak ada, atau serahkan ke agent? | Wajib |
| Q3: Notifikasi status | In-app, In-app + email, halaman status saja, atau serahkan ke agent? | In-app + email |
| Q4: Batas pengambilan | Ada batas waktu, tidak ada batas, atau serahkan ke agent? | Ada batas waktu |

**Notes:** User menginginkan fleksibilitas batch approve namun tetap menuntut alasan yang wajib diisi jika me-reject.

---

## Pengembalian Buku

| Option | Description | Selected |
|--------|-------------|----------|
| Q1: Proses pengembalian | Input kode, Scan Barcode/QR, Pilih dari daftar, atau serahkan ke agent? | Scan Barcode/QR |
| Q2: Perhitungan telat | Otomatis saat scan, manual/review, atau serahkan ke agent? | Otomatis |
| Q3: Perpanjangan pinjam | Extend otomatis, harus request approval, tidak ada perpanjangan online, atau serahkan ke agent? | Harus request approval |

**Notes:** Pemilihan scan QR/Barcode sangat berpengaruh pada UI/UX pustakawan dan integrasi dengan kamera device.

---

## Deteksi & Notifikasi Keterlambatan

| Option | Description | Selected |
|--------|-------------|----------|
| Q1: Masa pinjam default | 7 hari, 14 hari, bervariasi, atau serahkan ke agent? | 14 hari |
| Q2: Pengiriman reminder | Sekali, berulang harian, pola reminder (H-1, H, H+3), atau serahkan ke agent? | Pola reminder |

**Notes:** Penggunaan pola reminder akan memerlukan cron job atau task scheduler di backend FastAPI.

---

## the agent's Discretion

Tidak ada pendelegasian keputusan level tinggi ke agent dalam sesi ini.
