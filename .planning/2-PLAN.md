# Phase 2 Plan — Book Catalog

## Goal
Menerapkan fitur katalog buku yang dapat dicari dan dikelola pustakawan, sesuai scope Phase 2 di ROADMAP.md.

## Scope
- Pencarian katalog buku dengan relevansi fuzzy pada `title`, `author`, `ISBN`.
- Filter `title`, `author`, `ISBN`, dan `availability`.
- Tampilkan semua hasil secara default, termasuk buku yang tidak tersedia.
- Label status ketersediaan yang jelas pada setiap entri buku.
- CRUD pustakawan untuk buku (create/read/update/delete).
- Hapus buku hanya dari halaman detail.
- Form tambah/edit lengkap dengan metadata buku penting.

## Success criteria
- [ ] Search endpoint mengembalikan hasil relevan untuk query di `title`, `author`, dan `ISBN`.
- [ ] Filter availability berfungsi dan dapat mempersempit hasil ke buku yang tersedia.
- [ ] Semua hasil tampil termasuk buku tidak tersedia, dengan label status.
- [ ] Pustakawan dapat membuat, mengedit, dan menghapus buku.
- [ ] Delete hanya tersedia di halaman detail, dengan konfirmasi.
- [ ] Data buku mencakup `title`, `author`, `ISBN`, `genre`, `publisher`, `publication_year`, dan `stock_count`.
- [ ] Ketersediaan ditentukan oleh `stock_count` dan status eksplisit.
- [ ] Student users hanya dapat melihat katalog dan detail buku.

## Tasks

### 1. Backend — Data model dan database
- [ ] Definisikan tabel `books` dengan kolom:
  - `id`
  - `title`
  - `author`
  - `isbn`
  - `genre`
  - `publisher`
  - `publication_year`
  - `stock_count`
  - `created_at`
  - `updated_at`
- [ ] Tambahkan mekanisme ketersediaan: buku dianggap tersedia jika `stock_count > 0`.
- [ ] Siapkan migration / schema SQL untuk PostgreSQL.

### 2. Backend — Search & filter API
- [ ] Implementasikan `GET /books` dengan parameter:
  - `q`
  - `author`
  - `isbn`
  - `available`
  - `page`
  - `page_size`
- [ ] Pastikan pencarian mendukung kecocokan fuzzy/relevansi dan tidak hanya exact match.
- [ ] Urutkan hasil berdasarkan relevansi query, dengan fallback ke judul alfabetis.
- [ ] Sertakan field ketersediaan dalam respons.

### 3. Backend — Book CRUD API
- [ ] Implementasikan `POST /books` untuk menambahkan buku baru.
- [ ] Implementasikan `GET /books/{book_id}` untuk detail buku.
- [ ] Implementasikan `PUT /books/{book_id}` untuk memperbarui metadata buku.
- [ ] Implementasikan `DELETE /books/{book_id}` untuk menghapus buku.
- [ ] Lindungi endpoint CRUD dengan otorisasi pustakawan via JWT.
- [ ] Verifikasi bahwa student user hanya bisa membaca katalog.

### 4. Frontend — Catalog and search UI
- [ ] Buat halaman katalog dengan search bar dan filter.
- [ ] Tampilkan daftar buku dengan `title`, `author`, `ISBN`, dan label ketersediaan.
- [ ] Tampilkan status `Tersedia` / `Tidak tersedia` secara jelas.
- [ ] Tautkan tiap entri buku ke halaman detail.

### 5. Frontend — Book detail and librarian management
- [ ] Buat halaman detail buku yang menampilkan semua metadata.
- [ ] Tampilkan tombol `Delete` hanya untuk pustakawan.
- [ ] Tambahkan halaman atau route terpisah untuk `Add Book` dan `Edit Book`.
- [ ] Gunakan form terstruktur untuk mengumpulkan metadata buku lengkap.
- [ ] Sembunyikan atau nonaktifkan kontrol manajemen untuk pengguna non-pustakawan.

### 6. Integration & auth alignment
- [ ] Pastikan UI mengambil peran pengguna dari token JWT.
- [ ] Pastikan pustakawan melihat kontrol CRUD di antarmuka, siswa tidak.
- [ ] Pastikan API menolak akses CRUD tanpa peran pustakawan.

### 7. Verification & testing
- [ ] Buat backend tests untuk search/filter, availability, dan CRUD.
- [ ] Buat frontend tests untuk katalog, pencarian, filter, dan form tambah/edit buku.
- [ ] Jalankan manual checklist verifikasi (lihat bagian "Verification").

## Verification

### Backend verification
- [ ] `GET /books?q=...` mengembalikan hasil relevan untuk judul/pengarang/ISBN.
- [ ] `available=true` hanya menampilkan buku dengan `stock_count > 0`.
- [ ] `POST/PUT/DELETE /books` hanya berhasil dengan JWT pustakawan.
- [ ] Buku yang tidak tersedia tetap muncul dalam hasil dan ditandai dengan benar.

### Frontend verification
- [ ] Katalog menampilkan buku dan status ketersediaan dengan jelas.
- [ ] Filter availability dapat mempersempit hasil sesuai pilihan.
- [ ] Halaman detail buku tersedia untuk semua pengguna.
- [ ] Tombol delete tampil hanya untuk pustakawan dan meminta konfirmasi.
- [ ] Form tambah/edit menangani semua metadata yang ditentukan.

## Notes
- Phase 1 harus menyelesaikan kerangka kerja dasar aplikasi, otentikasi JWT, dan koneksi PostgreSQL.
- Jika Phase 1 implementasinya belum tersedia, Phase 2 akan mencakup penempatan fitur katalog di dalam struktur aplikasi yang sama.
- Ide foto buku dicatat sebagai deferred idea dan tidak termasuk dalam Phase 2.
