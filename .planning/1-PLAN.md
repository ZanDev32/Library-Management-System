# 1-PLAN

## Tujuan Fase 1
Menyiapkan kerangka kerja teknis dan otentikasi yang stabil untuk LMS Universitas XYZ.

## Sasaran
- Backend FastAPI berjalan pada Docker bersama PostgreSQL (prod) dan SQLite (dev).
- Frontend React + TypeScript + Vite dapat di-build dan dijalankan dalam Docker.
- Pengguna dapat mendaftar, login, dan menerima JWT.
- Buku dapat ditampilkan dan dikelola dengan kontrol akses.

## Deliverables
1. Struktur proyek dan `docker-compose.yml`.
2. Model database untuk:
   - pengguna (`users`)
   - peran / role (`roles` atau `role` pada tabel pengguna)
   - buku (`books`)
   - catatan peminjaman dasar (opsional, placeholder untuk fase 3)
3. API backend:
   - `POST /auth/register`
   - `POST /auth/login`
   - `GET /auth/me`
   - `GET /books`
   - `GET /books/{id}`
   - `POST /books` (hanya `librarian`)
   - `PUT /books/{id}` (hanya `librarian`)
   - `DELETE /books/{id}` (hanya `librarian`)
4. Middleware keamanan JWT dan dekorator RBAC di FastAPI.
5. Frontend React:
   - Halaman login.
   - Halaman registrasi.
   - Halaman daftar buku.
   - Halaman manajemen buku untuk pustakawan.
6. Dokumentasi singkat cara menjalankan `docker compose up`.

## Langkah Eksekusi
1. Siapkan `docker-compose.yml` dengan layanan:
   - `backend` (FastAPI)
   - `frontend` (React)
   - `db` (PostgreSQL)
2. Buat backend FastAPI:
   - konfigurasi environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES`)
   - koneksi ke PostgreSQL
   - model Pydantic untuk request/response
   - setup hashing password dan JWT helper
3. Desain database awal:
   - `users`: id, email, password_hash, role, created_at
   - `books`: id, title, author, isbn, published_year, available, created_at
   - (opsional) `borrow_records`: placeholder untuk fase 3
4. Implementasi endpoint auth dan proteksi akses.
5. Implementasi endpoint buku dengan otorisasi librarian.
6. Buat UI React sederhana:
   - form login dan register
   - daftar buku yang memanggil API `GET /books`
   - form tambah/edit buku hanya muncul untuk `librarian`
7. Uji manual:
   - daftar mahasiswa, login, cek akses.
   - buat akun pustakawan seed dan akses CRUD buku.
   - jalankan `docker compose up` dan verifikasi stack hidup.

## Kriteria Keberhasilan
- [ ] Mahasiswa dapat mendaftar dan login dengan JWT.
- [ ] Token JWT diverifikasi oleh backend untuk endpoint terproteksi.
- [ ] Pustakawan dapat membuat, mengubah, dan menghapus buku.
- [ ] Mahasiswa dapat melihat daftar buku.
- [ ] `docker compose up` memulai backend, frontend, dan database.

## Verifikasi
- Jalankan `POST /auth/register` lalu `POST /auth/login`.
- Pastikan `Authorization: Bearer <token>` bekerja pada `GET /books`.
- Coba akses endpoint CRUD buku dengan token mahasiswa; harus ditolak.
- Coba akses dengan token pustakawan; harus diizinkan.
- Pastikan UI login/registrasi bekerja dan simpan token di browser session.

## Catatan Tambahan
- Fase 1 adalah fondasi; tidak perlu menyelesaikan proses peminjaman penuh.
- Semua fitur peminjaman, return, dan overdue dialihkan ke fase 3.
- Gunakan PostgreSQL dan Docker untuk konsistensi lingkungan.
