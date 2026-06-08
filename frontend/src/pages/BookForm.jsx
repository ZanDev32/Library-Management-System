import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createBook, updateBook, getBook } from '../api'

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  publisher: '',
  publication_year: '',
  stock_count: '',
}

export default function BookForm({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (!isEdit) {
      return
    }

    async function loadBook() {
      setLoading(true)
      setError(null)
      try {
        const book = await getBook(id)
        setForm({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          genre: book.genre,
          publisher: book.publisher,
          publication_year: book.publication_year,
          stock_count: book.stock_count,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      genre: form.genre.trim(),
      publisher: form.publisher.trim(),
      publication_year: Number(form.publication_year),
      stock_count: Number(form.stock_count),
    }

    if (!payload.title || !payload.author || !payload.isbn) {
      setError('Judul, penulis, dan ISBN harus diisi.')
      return
    }

    if (Number.isNaN(payload.publication_year) || Number.isNaN(payload.stock_count)) {
      setError('Tahun terbit dan stok harus berupa angka yang valid.')
      return
    }

    try {
      let createdBook
      if (isEdit) {
        createdBook = await updateBook(id, payload)
      } else {
        createdBook = await createBook(payload)
      }
      navigate(`/books/${createdBook.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user || user.role !== 'librarian') {
    return (
      <div className="page">
        <p>Hanya pustakawan yang dapat mengakses halaman ini.</p>
        <Link className="button secondary" to="/books">
          Kembali ke daftar buku
        </Link>
      </div>
    )
  }

  if (loading) {
    return <div className="page">Memuat data buku...</div>
  }

  return (
    <div className="page book-form-page">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</h1>
          <p>Isi metadata buku secara lengkap sebelum menyimpan.</p>
        </div>
        <Link className="button secondary" to="/books">
          Kembali ke daftar
        </Link>
      </div>

      <form className="book-form" onSubmit={handleSubmit}>
        <label>
          Judul
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Penulis
          <input name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label>
          ISBN
          <input name="isbn" value={form.isbn} onChange={handleChange} required />
        </label>
        <label>
          Genre
          <input name="genre" value={form.genre} onChange={handleChange} required />
        </label>
        <label>
          Penerbit
          <input name="publisher" value={form.publisher} onChange={handleChange} required />
        </label>
        <label>
          Tahun terbit
          <input name="publication_year" type="number" value={form.publication_year} onChange={handleChange} required />
        </label>
        <label>
          Stok buku
          <input name="stock_count" type="number" value={form.stock_count} onChange={handleChange} required />
        </label>
        <button type="submit" className="button primary">
          {isEdit ? 'Simpan Perubahan' : 'Tambahkan Buku'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
