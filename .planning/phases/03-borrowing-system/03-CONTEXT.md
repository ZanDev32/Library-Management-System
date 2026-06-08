# Phase 3: Borrowing System - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Sistem Peminjaman (Borrowing System). Fase ini memberikan fungsionalitas bagi mahasiswa untuk meminta pinjaman buku, pustakawan untuk menyetujui/menolak permintaan, mengelola siklus pengembalian buku, dan mendeteksi serta mengirim notifikasi terkait keterlambatan pengembalian buku.

</domain>

<decisions>
## Implementation Decisions

### Alur Permintaan Pinjam
- **D-01:** Permintaan pinjam menggunakan alur dua langkah — mahasiswa klik "Pinjam", muncul konfirmasi (ringkasan & tanggal), kemudian submit.
- **D-02:** Tidak ada batasan sistem untuk jumlah maksimal buku yang bisa dipinjam bersamaan. Pustakawan memiliki kendali penuh via approve/reject.
- **D-03:** Mahasiswa bisa request masuk antrian (waitlist) jika buku sedang tidak tersedia (semua copy sedang dipinjam).
- **D-04:** Status permintaan yang ditampilkan ke mahasiswa menggunakan 3 status sederhana: `Menunggu` → `Disetujui` / `Ditolak`.

### Approve/Reject oleh Pustakawan
- **D-05:** Pustakawan bisa melakukan batch approve/reject (via checkbox) maupun proses satu per satu dengan membuka detail individual.
- **D-06:** Alasan penolakan WAJIB diisi oleh pustakawan saat menolak (reject) permintaan.
- **D-07:** Notifikasi in-app dan email otomatis akan dikirim ke mahasiswa saat status permintaannya berubah.
- **D-08:** Ada batas waktu (misal 2 hari) untuk pengambilan buku setelah disetujui. Jika melewati batas, persetujuan otomatis batal.

### Pengembalian Buku
- **D-09:** Pustakawan memproses pengembalian dengan cara Scan Barcode/QR (mahasiswa menunjukkan QR dari app atau buku discan barcode-nya).
- **D-10:** Sistem secara otomatis mendeteksi keterlambatan, menghitung total hari telat, dan mencatat riwayat pada saat buku discan untuk dikembalikan.
- **D-11:** Perpanjangan masa pinjam (extend) bisa diminta oleh mahasiswa melalui aplikasi, namun membutuhkan approval dari pustakawan.

### Deteksi & Notifikasi Keterlambatan
- **D-12:** Masa pinjam default untuk sebuah buku adalah 14 hari.
- **D-13:** Notifikasi keterlambatan dikirimkan menggunakan pola reminder: H-1 sebelum jatuh tempo, pada hari H (jatuh tempo), dan H+3 keterlambatan.

### the agent's Discretion
Semua keputusan kunci sudah diambil. Implementasi spesifik UI, skema email, dan detil teknis QR code dapat ditentukan saat fase planning.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/PROJECT.md` — Core requirements, target users, and non-functional requirements (FastAPI, React, PostgreSQL).
- `PROJECT_SPEC.md` — Original human-written brief providing broader business context.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- JWT Authentication & Roles (dari Fase 1) — Gunakan untuk membedakan endpoint/UI mana yang bisa diakses oleh `student` dan mana yang oleh `librarian`.
- Book Database Model (dari Fase 2) — Pinjaman harus merelasikan User ID dengan Book ID dan mengupdate nilai ketersediaan copy buku.

### Integration Points
- Sistem status ketersediaan buku dari katalog (Fase 2) akan langsung terpengaruh oleh status peminjaman dan waitlist di Fase 3 ini.

</code_context>

<specifics>
## Specific Ideas

- Penggunaan QR/Barcode scanner untuk proses pengembalian buku di sisi pustakawan agar mempercepat proses fisik.
- Alur 2 langkah saat request pinjam bertujuan mengurangi salah klik oleh mahasiswa.

</specifics>

<deferred>
## Deferred Ideas

- Tidak ada denda uang (fine payment) yang diimplementasikan; sistem hanya mencatat hari telat. Ini sudah dikonfirmasi di `PROJECT.md` (Out of Scope).

</deferred>

---

*Phase: 3-Borrowing System*
*Context gathered: 2026-06-08*
