import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getBook, deleteBook } from '../api/books'
import { requestBorrow } from '../api/borrows'
import type { Book } from '../types/book'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [borrowMsg, setBorrowMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function loadBook() {
      setLoading(true)
      setError(null)
      try {
        const data = await getBook(id)
        setBook(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book')
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id])

  const handleDelete = async () => {
    if (!id || !globalThis.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return
    try {
      await deleteBook(id)
      navigate('/books')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book')
    }
  }

  const handleBorrow = async () => {
    if (!id) return
    setBorrowMsg(null)
    setError(null)
    try {
      await requestBorrow({ book_id: id })
      setBorrowMsg('Permintaan peminjaman berhasil dikirim. Menunggu persetujuan pustakawan.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permintaan')
    }
  }

  if (loading) return <div style={styles.container}>Memuat detail buku...</div>
  if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>
  if (!book) return <div style={styles.container}>Buku tidak ditemukan.</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{book.title}</h1>
          <p style={styles.author}>{book.author}</p>
          <span style={{ ...styles.badge, ...(book.available ? styles.badgeAvailable : styles.badgeUnavailable) }}>
            {book.available ? 'Tersedia' : 'Tidak tersedia'}
          </span>
        </div>
        <div style={styles.actions}>
          <Link to="/books" style={styles.backBtn}>← Kembali ke daftar</Link>
          {user?.role === 'student' && book.available && (
            <button onClick={handleBorrow} style={styles.borrowBtn}>Pinjam Buku</button>
          )}
          {user?.role === 'librarian' && (
            <>
              <Link to={`/books/${book.id}/edit`} style={styles.editBtn}>Edit</Link>
              <button onClick={handleDelete} style={styles.deleteBtn}>Hapus</button>
            </>
          )}
        </div>
      </div>

      {borrowMsg && <p style={styles.success}>{borrowMsg}</p>}

      <div style={styles.metadata}>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Penerbit:</strong> {book.publisher ?? '-'}</p>
        <p><strong>Tahun terbit:</strong> {book.year ?? '-'}</p>
        <p><strong>Total stok:</strong> {book.quantity}</p>
        <p><strong>Tersedia:</strong> {book.available_quantity}</p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' },
  title: { fontSize: '1.5rem', margin: 0, color: 'var(--primary-color)' },
  author: { color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' },
  badge: { fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px' },
  badgeAvailable: { background: '#dcfce7', color: '#166534' },
  badgeUnavailable: { background: '#fee2e2', color: '#991b1b' },
  actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  backBtn: { padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'var(--text-color)', background: 'var(--surface-color)' },
  editBtn: { padding: '0.4rem 0.8rem', background: 'var(--primary-color)', color: '#fff', borderRadius: 'var(--radius)', textDecoration: 'none' },
  deleteBtn: { padding: '0.4rem 0.8rem', background: 'var(--danger-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' },
  borrowBtn: { padding: '0.4rem 0.8rem', background: 'var(--success-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' },
  success: { color: '#166534', background: '#dcfce7', padding: '0.6rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' },
  metadata: { background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius)', lineHeight: 1.8, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' },
  error: { color: 'var(--danger-color)' },
}
