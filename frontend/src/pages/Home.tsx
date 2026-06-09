import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Home() {
  const { user } = useAuth()

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="page-title">🏠 Selamat Datang, {user?.full_name}</h1>
        <p className="page-subtitle">Pilih menu untuk mulai menggunakan sistem perpustakaan.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <Link to="/books" style={styles.card}>
            <span style={{ fontSize: '2rem' }}>📚</span>
            <strong>Katalog Buku</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Telusuri &amp; pinjam buku</span>
          </Link>
          <Link to="/my-loans" style={styles.card}>
            <span style={{ fontSize: '2rem' }}>📋</span>
            <strong>Peminjaman Saya</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lihat status peminjaman</span>
          </Link>
          {user?.role === 'librarian' && (
            <Link to="/dashboard" style={styles.card}>
              <span style={{ fontSize: '2rem' }}>🏛️</span>
              <strong>Dashboard Pustakawan</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kelola peminjaman</span>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)',
    background: 'var(--surface-color)',
    textDecoration: 'none',
    color: 'var(--text-color)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
}
