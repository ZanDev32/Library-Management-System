import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBook, fetchBook, updateBook } from '../services/books'

interface Props {
  editMode?: boolean
}

export default function BookFormPage({ editMode = false }: Props) {
  const params = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editMode && params.id) {
      fetchBook(Number(params.id))
        .then((book) => {
          setTitle(book.title)
          setAuthor(book.author)
          setIsbn(book.isbn || '')
          setPublishedYear(book.published_year?.toString() || '')
        })
        .catch(() => setError('Failed to load book.'))
    }
  }, [editMode, params.id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const payload = {
        title,
        author,
        isbn: isbn || undefined,
        published_year: publishedYear ? Number(publishedYear) : undefined,
      }
      if (editMode && params.id) {
        await updateBook(Number(params.id), payload)
      } else {
        await createBook(payload)
      }
      navigate('/books')
    } catch (err) {
      setError('Failed to save book.')
    }
  }

  return (
    <div className="card">
      <h2>{editMode ? 'Edit Book' : 'New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Author
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </label>
        <label>
          ISBN
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        </label>
        <label>
          Published Year
          <input value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} type="number" />
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
