# Phase 2 Research — Book Catalog

## Purpose
Memvalidasi pendekatan teknis untuk fitur katalog buku dan CRUD pustakawan pada Phase 2.

## Inputs
- `.planning/2-CONTEXT.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`

## Current state
- Repo saat ini hanya berisi dokumen perencanaan, tidak ada kode backend atau frontend terpasang.
- Phase 2 akan dibangun di atas stack yang diusulkan: FastAPI, React, PostgreSQL.
- Prioritas adalah memenuhi scope: pencarian katalog, filter, label ketersediaan, dan CRUD buku oleh pustakawan.

## Research findings

### Search dan relevansi
- `title`, `author`, dan `ISBN` adalah bidang pencarian utama.
- Relevansi cerdas dapat dicapai dengan beberapa pendekatan PostgreSQL:
  - `ILIKE` / `UNACCENT` token matching untuk implementasi sederhana.
  - `pg_trgm` atau full-text search untuk fuzzy matching dan peringkat relevansi yang lebih baik.
- Karena repo belum memiliki kode, pendekatan awal yang wajar adalah membangun abstraksi query yang mendukung:
  - `q` sebagai kata kunci pencarian umum
  - filter spesifik untuk `author`, `isbn`, dan `availability`
  - ordering berdasarkan kecocokan query sebelum `title` alfabetis sebagai fallback.

### Book metadata dan ketersediaan
- Metadata buku yang diperlukan:
  - `title`
  - `author`
  - `ISBN`
  - `genre`
  - `publisher`
  - `publication_year`
  - `stock_count`
- Ketersediaan harus ditentukan oleh `stock_count` dan juga tampilkan status eksplisit (`Tersedia` / `Tidak tersedia`).

### CRUD pustakawan
- Pustakawan harus memiliki akses API untuk `create`, `read`, `update`, dan `delete` entri buku.
- Penghapusan sebaiknya diaktifkan dari tampilan detail buku, dengan konfirmasi eksplisit.
- UI CRUD harus disembunyikan bagi pengguna mahasiswa.

## Recommended approach

1. Buat model `Book` dan tabel PostgreSQL dengan semua metadata buku di atas.
2. Implementasikan endpoint API `/books` untuk pencarian dan filter dengan parameter:
   - `q`
   - `author`
   - `isbn`
   - `available`
   - `page`, `page_size`
3. Pastikan API search mengembalikan semua buku secara default, termasuk yang tidak tersedia, dan menandainya dengan label ketersediaan.
4. Implementasikan endpoint CRUD berikut untuk pustakawan:
   - `POST /books`
   - `GET /books/{id}`
   - `PUT /books/{id}`
   - `DELETE /books/{id}`
5. Terapkan kontrol peran JWT sehingga hanya pustakawan yang dapat membuat, mengubah, dan menghapus buku.
6. Di frontend, bangun halaman katalog buku, halaman detail, dan form tambah/edit yang terstruktur.

## Open questions
- Jika implementasi awal menggunakan `ILIKE`, apakah kita akan menambahkan `pg_trgm` di fase berikutnya untuk meningkatkan fuzzy search? (Ini dapat ditangani oleh planner sebagai risiko / iterasi berikutnya.)
