import { useAuth } from '../contexts/AuthContext'

/**
 * Top navigation bar — Academic theme ported from feature/phase-04-dashboard-polish.
 * Shows university branding, a student/librarian role indicator, and the current user.
 */
export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="app-navbar">
      <div className="brand">
        <span>📚</span>
        <span>Perpustakaan Universitas XYZ</span>
      </div>

      <div className="role-switch">
        <button className={user?.role === 'student' ? 'active' : ''} type="button" disabled>
          🎓 Mahasiswa
        </button>
        <button className={user?.role === 'librarian' ? 'active' : ''} type="button" disabled>
          🧑‍🏫 Pustakawan
        </button>
      </div>

      <div className="nav-user">
        <span>{user?.full_name}</span>
        <span className="role-badge">
          {user?.role === 'librarian' ? 'Pustakawan' : 'Mahasiswa'}
        </span>
        <button type="button" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
