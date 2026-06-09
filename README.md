# 📚 Library Management System — Universitas XYZ

Sistem Manajemen Perpustakaan berbasis web untuk kampus. Mahasiswa dapat menelusuri katalog, meminjam buku, dan memantau status peminjaman. Pustakawan dapat mengelola inventaris, menyetujui permintaan, dan memantau sirkulasi dari satu dashboard.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

**Mahasiswa (Student)**
- Browse katalog 1000+ buku dengan kartu berwarna dan ikon
- Pinjam buku atau masuk antrian jika stok habis
- Pantau status peminjaman aktif, overdue, dan riwayat

**Pustakawan (Librarian)**
- Dashboard dengan metrik real-time (Pending / Aktif / Overdue / Dikembalikan)
- Approve/reject permintaan peminjaman via tabel bertab
- Kelola buku (CRUD) dan pengguna

**System**
- JWT authentication (access token 30 min + refresh token 7 hari httpOnly cookie)
- Auto-seed 1000 buku dummy + librarian admin on first start
- Academic Clean UI theme (dark slate + maroon accent)
- Responsive — mobile friendly
- HMR development via volume mounts (no rebuild needed for frontend changes)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, React Router 7, Axios |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2 (async), Pydantic v2 |
| Database | PostgreSQL 18 Alpine |
| Auth | JWT (python-jose) + bcrypt 4.0.1 via passlib |
| Infra | Docker Compose (3 services) |

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose v2+
- Git

### Setup

```bash
# 1. Clone
git clone https://github.com/ZanDev32/Library-Management-System.git
cd Library-Management-System

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum change SECRET_KEY and DB_PASSWORD for production

# 3. Start all services
docker compose up --build

# 4. Open in browser
# App:      http://localhost:60
# API docs: http://localhost:60/api/docs (proxied via Vite)
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Librarian (Admin) | `admin@university.ac.id` | `changeme_admin_password` |

> Register a new account via `/register` to get a student role.

---

## 📁 Project Structure

```
Library-Management-System/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, security, dependencies, seed scripts
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers
│   │   └── services/      # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client & interceptors
│   │   ├── components/    # Navbar, Layout, ProtectedRoute, RoleGuard
│   │   ├── contexts/      # AuthContext (JWT + refresh)
│   │   ├── pages/         # Landing, Login, Register, Home, BookCatalog,
│   │   │                  # LibrarianDashboard, MyLoans, BookForm, etc.
│   │   ├── types/         # TypeScript interfaces (Book, User, Borrow)
│   │   └── index.css      # Academic Clean theme
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🐳 Services

| Service | Container | Internal Port | Exposed Port |
|---------|-----------|---------------|--------------|
| Frontend | `lms_frontend` | 5173 | **60** |
| Backend | `lms_backend` | 8000 | — (proxied via Vite) |
| Database | `lms_db` | 5432 | — (internal only) |

The Vite dev server proxies `/api` requests to the backend container.

---

## 🔧 Environment Variables

```env
# Database
DB_PASSWORD=changeme_in_production
POSTGRES_DB=lms_db
POSTGRES_USER=lms_user

# Backend
SECRET_KEY=changeme_generate_a_random_secret
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Frontend
VITE_API_URL=/api

# Seed (auto-created librarian)
ADMIN_EMAIL=admin@university.ac.id
ADMIN_PASSWORD=changeme_admin_password
```

---

## 📖 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register student | — |
| POST | `/api/auth/login` | Login (returns tokens) | — |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| GET | `/api/auth/me` | Current user info | Bearer |
| GET | `/api/books` | List books (paginated) | Bearer |
| POST | `/api/books` | Create book | Librarian |
| GET | `/api/books/:id` | Book detail | Bearer |
| PUT | `/api/books/:id` | Update book | Librarian |
| DELETE | `/api/books/:id` | Delete book | Librarian |
| POST | `/api/borrows` | Borrow a book | Student |
| GET | `/api/borrows/my` | My loans | Student |
| GET | `/api/borrows` | All borrows | Librarian |
| PUT | `/api/borrows/:id/approve` | Approve request | Librarian |
| PUT | `/api/borrows/:id/reject` | Reject request | Librarian |
| PUT | `/api/borrows/:id/return` | Mark returned | Librarian |

Full interactive docs available at `/api/docs` (Swagger UI) when running.

---

## 🧑‍💻 Development

```bash
# Rebuild after backend dependency changes
docker compose up --build backend

# View logs
docker compose logs -f backend

# Access database
docker compose exec db psql -U lms_user -d lms_db

# Reset database (destroys all data)
docker compose down -v && docker compose up --build
```

Frontend changes apply instantly via HMR — no rebuild needed.

---

## 🗺️ Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/home` | Home (menu cards) | Authenticated |
| `/books` | Book Catalog | Authenticated |
| `/books/new` | Add Book | Librarian |
| `/books/:id` | Book Detail | Authenticated |
| `/books/:id/edit` | Edit Book | Librarian |
| `/my-loans` | My Loans | Student |
| `/dashboard` | Librarian Dashboard | Librarian |

---

## 👥 Team

**Semua Milik Allah Team**

---

## 📄 License

MIT
