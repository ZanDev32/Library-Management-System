import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchBooks, type BookFilters } from '../api/books'
import type { Book } from '../types/book'

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daftar Buku</h1>
          <p style={styles.subtitle}>Telusuri koleksi buku berdasarkan judul, penulis, atau ISBN.</p>
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

      {loading && <p>Memuat daftar buku...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && books.length === 0 && <p>Tidak ada buku yang ditemukan.</p>}

      <div style={styles.grid}>
        {books.map((book) => (
          <article key={book.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.bookTitle}>{book.title}</h2>
              <span style={{ ...styles.badge, ...(book.available ? styles.badgeAvailable : styles.badgeUnavailable) }}>
                {book.available ? 'Tersedia' : 'Tidak tersedia'}
              </span>
            </div>
            <p style={styles.bookAuthor}>{book.author}</p>
            <p style={styles.bookIsbn}>ISBN: {book.isbn}</p>
            <Link to={`/books/${book.id}`} style={styles.detailLink}>
              Lihat detail →
            </Link>
          </article>
        ))}
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
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', margin: 0 },
  subtitle: { color: '#666', margin: '0.25rem 0 0' },
  addBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem' },
  searchForm: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  input: { padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  select: { padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  searchBtn: { padding: '0.4rem 0.8rem', background: '#f3f4f6', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  error: { color: '#dc2626' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  bookTitle: { fontSize: '1rem', margin: 0 },
  badge: { fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', whiteSpace: 'nowrap' },
  badgeAvailable: { background: '#dcfce7', color: '#166534' },
  badgeUnavailable: { background: '#fee2e2', color: '#991b1b' },
  bookAuthor: { color: '#4b5563', margin: '0.5rem 0 0.25rem' },
  bookIsbn: { color: '#6b7280', fontSize: '0.85rem', margin: 0 },
  detailLink: { display: 'inline-block', marginTop: '0.75rem', color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  pageBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' },
}
