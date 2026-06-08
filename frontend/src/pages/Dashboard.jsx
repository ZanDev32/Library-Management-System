import { Link } from 'react-router-dom'

export default function Dashboard({ user }) {
  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role}</p>
      <p>Use the catalog below to browse the library collection.</p>
      <div className="dashboard-actions">
        <Link className="button primary" to="/books">
          Buka Katalog Buku
        </Link>
        {user.role === 'librarian' && (
          <Link className="button" to="/books/new">
            Tambahkan Buku
          </Link>
        )}
      </div>
    </div>
  )
}
