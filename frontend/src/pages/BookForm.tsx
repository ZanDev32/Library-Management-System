import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createBook, updateBook, getBook } from '../api/books'

interface FormState {
  title: string
  author: string
  isbn: string
  publisher: string
  year: string
  quantity: string
}

const emptyForm: FormState = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  year: '',
  quantity: '1',
}

export default function BookForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(id)

  useEffect(() => {
    if (!isEdit || !id) return
    async function loadBook() {
      setLoading(true)
      setError(null)
      try {
        const book = await getBook(id!)
        setForm({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher ?? '',
          year: book.year?.toString() ?? '',
          quantity: book.quantity.toString(),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book')
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id, isEdit])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim()) {
      setError('Judul, penulis, dan ISBN harus diisi.')
      return
    }

    const yearNum = form.year ? Number(form.year) : undefined
    const quantityNum = Number(form.quantity)

    if (form.year && (Number.isNaN(yearNum) || yearNum < 0)) {
      setError('Tahun terbit harus berupa angka yang valid.')
      return
    }
    if (Number.isNaN(quantityNum) || quantityNum < 0) {
      setError('Stok harus berupa angka yang valid.')
      return
    }

    try {
      if (isEdit && id) {
        const updated = await updateBook(id, {
          title: form.title.trim(),
          author: form.author.trim(),
          isbn: form.isbn.trim(),
          publisher: form.publisher.trim() || undefined,
          year: yearNum,
          quantity: quantityNum,
        })
        navigate(`/books/${updated.id}`)
      } else {
        const created = await createBook({
          title: form.title.trim(),
          author: form.author.trim(),
          isbn: form.isbn.trim(),
          publisher: form.publisher.trim() || undefined,
          year: yearNum,
          quantity: quantityNum,
        })
        navigate(`/books/${created.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  if (!user || user.role !== 'librarian') {
    return (
      <div style={styles.container}>
        <p>Hanya pustakawan yang dapat mengakses halaman ini.</p>
        <Link to="/books" style={styles.backBtn}>Kembali ke daftar buku</Link>
      </div>
    )
  }

  if (loading) return <div style={styles.container}>Memuat data buku...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</h1>
          <p style={styles.subtitle}>Isi metadata buku secara lengkap sebelum menyimpan.</p>
        </div>
        <Link to="/books" style={styles.backBtn}>← Kembali ke daftar</Link>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>
          Judul
          <input style={styles.input} name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label style={styles.label}>
          Penulis
          <input style={styles.input} name="author" value={form.author} onChange={handleChange} required />
        </label>
        <label style={styles.label}>
          ISBN
          <input style={styles.input} name="isbn" value={form.isbn} onChange={handleChange} required />
        </label>
        <label style={styles.label}>
          Penerbit
          <input style={styles.input} name="publisher" value={form.publisher} onChange={handleChange} />
        </label>
        <label style={styles.label}>
          Tahun terbit
          <input style={styles.input} name="year" type="number" value={form.year} onChange={handleChange} />
        </label>
        <label style={styles.label}>
          Stok buku
          <input style={styles.input} name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
        </label>
        <button type="submit" style={styles.submitBtn}>
          {isEdit ? 'Simpan Perubahan' : 'Tambahkan Buku'}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '600px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', margin: 0 },
  subtitle: { color: '#666', margin: '0.25rem 0 0' },
  backBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: '#333', background: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 500 },
  input: { padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  submitBtn: { marginTop: '0.5rem', padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#dc2626', marginTop: '1rem' },
}
