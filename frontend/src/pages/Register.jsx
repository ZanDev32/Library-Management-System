import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'

export default function Register({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await register({ name, email, password, role })
      const loginResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        body: new URLSearchParams({ username: email, password }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const data = await loginResponse.json()
      localStorage.setItem('access_token', data.access_token)
      const user = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }).then((res) => res.json())
      onRegister(user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
          </select>
        </label>
        <button type="submit">Register</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Sudah punya akun? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
