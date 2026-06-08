import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { getCurrentUser } from './api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const current = await getCurrentUser()
      setUser(current)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) {
    return <div className="app-shell">Loading...</div>
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onRegister={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
