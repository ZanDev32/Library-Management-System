import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchBooks, type BookFilters } from '../api/books'
import { requestBorrow } from '../api/borrows'
import type { Book } from '../types/book'
import Layout from '../components/Layout'

const CARD_COLORS = ['#d5e8d4', '#dae8fc', '#fff2cc', '#f8cecc', '#e1d5e7', '#d5e8d4']
const CARD_ICONS = ['📊', '💻', '🌐', '⚙️', '🤖', '📱', '🧮', '📈', '🔬', '🎓']

export default function BookCatalog() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [q, setQ] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [available, setAvailable] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [borrowMsg, setBorrowMsg] = useState<string | null>(null)
  const pageSize = 12

  useEffect(() => {
    async function loadBooks() {
      setLoading(true)
      setError(null)
      try {
        const filters: BookFilters = {
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
        setError(err instanceof Error ? err.message : 'Failed to load books')
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [q, author, isbn, available, page])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
  }

  const handleBorrow = async (bookId: string) => {
    setBorrowMsg(null)
    setError(null)
    try {
      await requestBorrow({ book_id: bookId })
      setBorrowMsg('Permintaan peminjaman berhasil dikirim. Menunggu persetujuan pustakawan.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permintaan')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 className="page-title">📖 Katalog Buku</h1>
          <p className="page-subtitle">Temukan dan pinjam buku dari koleksi perpustakaan</p>
        </div>
        {user?.role === 'librarian' && (
          <Link to="/books/new" style={styles.addBtn}>
            + Tambah Buku Baru
          </Link>
        )}
      </div>

      <form style={styles.searchForm} onSubmit={handleSearch}>
        <input
          style={styles.input}
          type="text"
          placeholder="Cari judul, penulis, ISBN"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Filter penulis"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input
          style={styles.input}
          type="text"
          placeholder="Filter ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <select style={styles.select} value={available} onChange={(e) => setAvailable(e.target.value)}>
          <option value="">Semua ketersediaan</option>
          <option value="true">Hanya tersedia</option>
        </select>
        <button type="submit" style={styles.searchBtn}>Terapkan</button>
      </form>

      {borrowMsg && <p style={styles.success}>{borrowMsg}</p>}
      {loading && <p>Memuat daftar buku...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && books.length === 0 && <p>Tidak ada buku yang ditemukan.</p>}

      <div className="book-grid">
        {books.map((book, idx) => {
          const color = CARD_COLORS[idx % CARD_COLORS.length]
          const icon = CARD_ICONS[idx % CARD_ICONS.length]
          return (
            <article key={book.id} className="book-card">
              <Link to={`/books/${book.id}`} className="cover" style={{ background: color, textDecoration: 'none' }}>
                {icon}
              </Link>
              <div className="body">
                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>
                <p className="isbn">ISBN: {book.isbn}</p>
                <p className={`stock ${book.available ? 'available' : 'unavailable'}`}>
                  {book.available ? `${book.available_quantity} copy tersedia` : 'Semua copy dipinjam'}
                </p>
                <div className="card-action">
                  {user?.role === 'student' ? (
                    book.available ? (
                      <button className="btn-borrow" onClick={() => handleBorrow(book.id)}>
                        📖 Pinjam
                      </button>
                    ) : (
                      <button className="btn-waitlist" onClick={() => handleBorrow(book.id)}>
                        📋 Masuk Antrian
                      </button>
                    )
                  ) : (
                    <Link to={`/books/${book.id}`} className="btn-borrow" style={{ textDecoration: 'none' }}>
                      Lihat Detail
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
        >
          ← Sebelumnya
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button
          style={styles.pageBtn}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Selanjutnya →
        </button>
      </div>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  addBtn: { padding: '0.5rem 1rem', background: 'var(--success-color)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  searchForm: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  input: { padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.9rem' },
  select: { padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.9rem' },
  searchBtn: { padding: '0.4rem 0.8rem', background: 'var(--primary-color)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  error: { color: 'var(--danger-color)' },
  success: { color: '#166534', background: '#dcfce7', padding: '0.6rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  pageBtn: { padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--surface-color)', cursor: 'pointer', color: 'var(--text-color)' },
}
