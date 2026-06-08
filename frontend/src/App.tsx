import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BooksPage from './pages/BooksPage'
import BookFormPage from './pages/BookFormPage'
import DashboardPage from './pages/Dashboard'
import { getCurrentUser } from './services/auth'

function App() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    getCurrentUser().then((data) => setUser(data)).catch(() => setUser(null))
  }, [])

  return (
    <div className="app-shell">
      <header>
        <h1>Library Management System</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/login" element={<LoginPage onLogin={() => getCurrentUser().then(setUser).catch(() => setUser(null))} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/books" element={<BooksPage user={user} />} />
          <Route path="/books/new" element={user?.role === 'librarian' ? <BookFormPage /> : <Navigate to="/login" replace />} />
          <Route path="/books/:id/edit" element={user?.role === 'librarian' ? <BookFormPage editMode /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={user?.role === 'librarian' ? <DashboardPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
