import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Library Management System</h1>
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <h2>Welcome, {user?.full_name}</h2>
        <span style={styles.badge}>{user?.role}</span>

        <nav style={styles.nav}>
          <Link to="/books" style={styles.navLink}>📚 Katalog Buku</Link>
        </nav>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' },
  title: { fontSize: '1.25rem', margin: 0 },
  logoutBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' },
  main: { marginTop: '2rem' },
  badge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', textTransform: 'capitalize' },
  nav: { marginTop: '2rem', display: 'flex', gap: '1rem' },
  navLink: { padding: '0.6rem 1.2rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: '#1f2937', fontSize: '1rem' },
}
