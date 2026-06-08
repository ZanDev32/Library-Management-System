# 1-CONTEXT

## Ringkasan Fase 1
Fase 1 adalah landasan teknis untuk aplikasi Library Management System.
Fokus utama adalah:
- Menyiapkan kerangka kerja FastAPI + React + PostgreSQL + Docker.
- Membangun autentikasi dan otorisasi dasar.
- Menentukan skema database awal untuk pengguna, peran, dan katalog buku.
- Menyediakan API dan UI awal untuk buku dan manajemen pengguna.

## Keputusan Utama
1. Autentikasi
   - Menggunakan email + password.
   - Token JWT dikeluarkan setelah login dan dipakai untuk mengakses endpoint terproteksi.
   - Password disimpan dengan hashing yang aman (misalnya bcrypt).

2. Pendaftaran pengguna
   - Mahasiswa dapat mendaftar sendiri dengan email/password.
   - Akun pustakawan tidak boleh self-register; dibuat secara manual oleh admin/seed data.
   - Peran awal: `student`, `librarian`, dan `admin` (opsional untuk seed dan pengelolaan).

3. Scope fase 1
   - Dititikberatkan pada otentikasi, otorisasi, dan kerangka data.
   - Fitur peminjaman/permintaan pinjam ditunda ke fase 3.
   - Fitur dashboard lengkap ditunda ke fase 4.

4. Teknologi
   - Backend: FastAPI (Python).
   - Frontend: React + TypeScript + Vite.
   - Database: PostgreSQL (Production), SQLite (Development).
   - ORM: SQLAlchemy / SQLModel.
   - Infrastruktur: Docker Compose untuk backend, frontend, dan database.
   - Deployment target: Render.com dengan asset storage Cloudflare R2.

5. Keamanan dan akses
   - Rute API harus dilindungi dengan JWT.
   - Endpoints manajemen buku hanya dapat diakses oleh peran `librarian`.
   - Endpoint daftar buku dan profil pengguna dapat diakses oleh `student` setelah login.

## Batasan yang Dikunci
- Tidak ada pemrosesan denda atau pembayaran di fase ini.
- Tidak ada integrasi email/SMS untuk notifikasi.
- Fitur perpustakaan yang kompleks seperti pinjam otomatis, perpanjangan, dan alarm denda belum termasuk.
- UI hanya perlu dasar login, registrasi, daftar buku, dan manajemen buku sederhana.

## Output yang Dibutuhkan untuk Perencana
- `Docker Compose` untuk lingkungan pengembangan penuh.
- Skema database awal dengan tabel pengguna, peran, buku, dan peminjaman minimal.
- API `register`, `login`, `me`, `books` CRUD dan proteksi role.
- UI React dasar dengan halaman login, registrasi, daftar buku, dan form buku untuk pustakawan.
