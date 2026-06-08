import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchBooks } from '../api'

export default function BookCatalog({ user }) {
  const [books, setBooks] = useState([])
  const [q, setQ] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [available, setAvailable] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBooks() {
      setLoading(true)
      setError(null)
      try {
        const filters = {
          q: q.trim() || undefined,
          author: author.trim() || undefined,
          isbn: isbn.trim() || undefined,
          available: available === '' ? undefined : available === 'true',
          page,
          page_size: pageSize,
        }
        const data = await fetchBooks(filters)
        setBooks(data.items)
        setTotal(data.total)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [q, author, isbn, available, page, pageSize])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="page catalog-page">
      <div className="page-header">
        <div>
          <h1>Daftar Buku</h1>
          <p>Telusuri koleksi buku berdasarkan judul, penulis, atau ISBN.</p>
        </div>
        {user.role === 'librarian' && (
          <Link className="button primary" to="/books/new">
            Tambah Buku Baru
          </Link>
        )}
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Cari judul, penulis, ISBN"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter penulis"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <select value={available} onChange={(e) => setAvailable(e.target.value)}>
          <option value="">Semua ketersediaan</option>
          <option value="true">Hanya tersedia</option>
        </select>
        <button type="submit">Terapkan</button>
      </form>

      {loading && <p>Memuat daftar buku...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && books.length === 0 && <p>Tidak ada buku yang ditemukan.</p>}

      <div className="book-grid">
        {books.map((book) => (
          <article key={book.id} className="book-card">
            <div className="book-card-header">
              <h2>{book.title}</h2>
              <span className={`badge ${book.available ? 'available' : 'unavailable'}`}>
                {book.available ? 'Tersedia' : 'Tidak tersedia'}
              </span>
            </div>
            <p>{book.author}</p>
            <p>ISBN: {book.isbn}</p>
            <Link className="button secondary" to={`/books/${book.id}`}>
              Lihat detail
            </Link>
          </article>
        ))}
      </div>

      <div className="pagination-row">
        <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page <= 1}>
          Sebelumnya
        </button>
        <span>
          Halaman {page} dari {totalPages}
        </span>
        <button type="button" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>
          Selanjutnya
        </button>
      </div>
    </div>
  )
}
