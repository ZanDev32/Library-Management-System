import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register(email, password, fullName)
      navigate('/login', { replace: true })
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.brand}>
          <span style={{ fontSize: '2rem' }}>📚</span>
          <span style={styles.brandText}>Perpustakaan Universitas XYZ</span>
        </div>
        <h1 style={styles.title}>Daftar</h1>
        <p style={styles.subtitle}>Buat akun mahasiswa Anda</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Nama Lengkap
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Konfirmasi Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Memproses...' : 'Buat Akun'}
        </button>

        <p style={styles.footer}>
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'var(--bg-color)',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'var(--surface-color)',
    padding: '2.5rem 2rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  brandText: { fontWeight: 700, color: 'var(--primary-color)', fontSize: '1rem' },
  title: { margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)', textAlign: 'center' },
  subtitle: { margin: 0, color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 600 },
  input: { padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '1rem' },
  button: {
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--primary-color)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { background: '#fee2e2', color: 'var(--danger-color)', padding: '0.5rem', borderRadius: 'var(--radius)', fontSize: '0.9rem' },
  footer: { textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' },
}
