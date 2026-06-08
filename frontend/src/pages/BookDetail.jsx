import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBook, deleteBook } from '../api'

export default function BookDetail({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBook() {
      setLoading(true)
      setError(null)
      try {
        const data = await getBook(id)
        setBook(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      return
    }
    try {
      await deleteBook(id)
      navigate('/books')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="page">Memuat detail buku...</div>
  }

  if (error) {
    return <div className="page error">{error}</div>
  }

  if (!book) {
    return <div className="page">Buku tidak ditemukan.</div>
  }

  return (
    <div className="page book-detail-page">
      <div className="page-header">
        <div>
          <h1>{book.title}</h1>
          <p>{book.author}</p>
          <span className={`badge ${book.available ? 'available' : 'unavailable'}`}>
            {book.available ? 'Tersedia' : 'Tidak tersedia'}
          </span>
        </div>
        <div className="detail-actions">
          <Link className="button secondary" to="/books">
            Kembali ke daftar
          </Link>
          {user.role === 'librarian' && (
            <>
              <Link className="button" to={`/books/${book.id}/edit`}>
                Edit
              </Link>
              <button className="button danger" onClick={handleDelete}>
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      <div className="book-metadata">
        <p>
          <strong>ISBN:</strong> {book.isbn}
        </p>
        <p>
          <strong>Genre:</strong> {book.genre}
        </p>
        <p>
          <strong>Penerbit:</strong> {book.publisher}
        </p>
        <p>
          <strong>Tahun terbit:</strong> {book.publication_year}
        </p>
        <p>
          <strong>Stok saat ini:</strong> {book.stock_count}
        </p>
      </div>
    </div>
  )
}
