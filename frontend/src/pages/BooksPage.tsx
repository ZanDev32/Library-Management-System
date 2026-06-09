import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBooks, deleteBook, Book } from '../services/books'
import { logout } from '../services/auth'

interface Props {
  user: { email: string; role: string } | null
}

export default function BooksPage({ user }: Props) {
  const [books, setBooks] = useState<Book[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setBooks([])
      return
    }
    fetchBooks()
      .then(setBooks)
      .catch(() => setError('Failed to load books.'))
  }, [user])

  const handleDelete = async (id: number) => {
    await deleteBook(id)
    setBooks((current) => current.filter((book) => book.id !== id))
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Books</h2>
        <button onClick={() => { logout(); window.location.href = '/login' }}>Logout</button>
      </div>
      {user && <p>Signed in as {user.email} ({user.role})</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user?.role === 'librarian' && <Link to="/books/new"><button>Add Book</button></Link>}
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Author</th>
            <th style={{ textAlign: 'left', padding: 8 }}>ISBN</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Year</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Available</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td style={{ padding: 8 }}>{book.title}</td>
              <td style={{ padding: 8 }}>{book.author}</td>
              <td style={{ padding: 8 }}>{book.isbn || '-'}</td>
              <td style={{ padding: 8 }}>{book.published_year || '-'}</td>
              <td style={{ padding: 8 }}>{book.available ? 'Yes' : 'No'}</td>
              <td style={{ padding: 8 }}>
                {user?.role === 'librarian' && (
                  <>
                    <Link to={`/books/${book.id}/edit`}><button>Edit</button></Link>
                    <button style={{ marginLeft: 8 }} onClick={() => handleDelete(book.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
