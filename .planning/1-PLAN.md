# Phase 1 Plan — Foundation

## Goal
Bangun pondasi aplikasi: kerangka kerja backend/frontend, PostgreSQL, dan otentikasi JWT dengan pemisahan peran siswa/pustakawan.

## Scope
- Proyek scaffold untuk backend FastAPI dan frontend React.
- Docker Compose untuk menjalankan backend, frontend, dan PostgreSQL bersama.
- Database schema dasar untuk pengguna.
- Authentication API untuk register dan login.
- JWT-based auth dengan role claim `student` / `librarian`.
- Protected backend route dan frontend route guard.

## Success criteria
- [ ] `docker compose up` menjalankan backend, frontend, dan database tanpa error.
- [ ] Pengguna dapat mendaftar dan login.
- [ ] Login mengembalikan JWT yang valid.
- [ ] Protected route ditolak tanpa token yang valid.
- [ ] Peran `student` dan `librarian` disimpan dalam token dan siap dipakai untuk otorisasi.
- [ ] Frontend memiliki halaman login dan pendaftaran, plus shell yang memeriksa autentikasi.

## Tasks

### 1. Proyek dan lingkungan
- [ ] Buat `docker-compose.yml` dengan service:
  - `backend` (FastAPI)
  - `frontend` (React)
  - `db` (PostgreSQL)
- [ ] Buat direktori `backend/` dan `frontend/` jika belum ada.
- [ ] Tambahkan file `.env.example` untuk variabel konfigurasi.

### 2. Backend: database dan model pengguna
- [ ] Definisikan model pengguna dengan bidang:
  - `id`
  - `name`
  - `email`
  - `hashed_password`
  - `role`
  - `created_at`
- [ ] Konfigurasikan koneksi PostgreSQL.
- [ ] Buat skema SQL atau migrasi awal untuk tabel pengguna.

### 3. Backend: otentikasi JWT
- [ ] Implementasikan endpoint `POST /auth/register`.
- [ ] Implementasikan endpoint `POST /auth/login`.
- [ ] Gunakan hashing password aman (`bcrypt` / `passlib`).
- [ ] Buat utilitas JWT untuk membuat dan memverifikasi token.
- [ ] Buat dependency FastAPI untuk memvalidasi token dan memeriksa role.
- [ ] Implementasikan endpoint `GET /users/me` sebagai route terproteksi contoh.

### 4. Frontend: antarmuka auth
- [ ] Buat halaman `Register`.
- [ ] Buat halaman `Login`.
- [ ] Simpan token yang diterima setelah login.
- [ ] Buat route guard untuk halaman yang memerlukan autentikasi.
- [ ] Tampilkan placeholder atau dashboard awal saat pengguna sudah login.

### 5. Authorization preparation
- [ ] Pastikan role `student` / `librarian` tersedia dalam JWT payload.
- [ ] Pastikan backend dapat menolak akses ke route yang memerlukan autentikasi.
- [ ] Pastikan frontend mencatat status login dan role pengguna.

### 6. Verification dan dokumentasi
- [ ] Tambahkan test dasar untuk register/login dan protected route.
- [ ] Verifikasi bahwa `docker compose up` berhasil dan layanan saling terhubung.
- [ ] Catat cara menjalankan proyek di `README.md` atau `DEVNOTES.md`.

## Verification

### Backend verification
- [ ] `POST /auth/register` membuat pengguna baru.
- [ ] `POST /auth/login` mengembalikan JWT.
- [ ] `GET /users/me` hanya berhasil dengan header `Authorization: Bearer {token}`.
- [ ] Token yang valid memuat peran pengguna.

### Frontend verification
- [ ] Halaman pendaftaran berfungsi dan bisa memanggil backend.
- [ ] Halaman login mengambil token dan menyimpannya.
- [ ] Halaman terlindungi tidak dapat diakses tanpa login.

## Notes
- Phase 1 tidak memasukkan fitur katalog atau peminjaman buku.
- Jangan membuat endpoint CRUD buku di Phase 1; itu disiapkan untuk Phase 2.
