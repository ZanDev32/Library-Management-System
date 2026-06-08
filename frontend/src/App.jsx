import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookCatalog from './pages/BookCatalog'
import BookDetail from './pages/BookDetail'
import BookForm from './pages/BookForm'
import { getCurrentUser, logout } from './api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUser() {
      const current = await getCurrentUser()
      setUser(current)
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return <div className="app-shell">Loading...</div>
  }

  return (
    <div className="app-shell">
      {user && (
        <header className="app-header">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/books">Katalog</Link>
            {user.role === 'librarian' && <Link to="/books/new">Tambah Buku</Link>}
          </nav>
          <div className="user-actions">
            <span>{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/books" element={user ? <BookCatalog user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/books/new" element={user ? <BookForm user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/books/:id" element={user ? <BookDetail user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/books/:id/edit" element={user ? <BookForm user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onRegister={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
