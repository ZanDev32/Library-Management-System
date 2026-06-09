import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const features = [
  {
    title: 'Katalog Buku',
    description: 'Cari ribuan judul berdasarkan nama, penulis, atau ISBN dan lihat ketersediaan real-time.',
    icon: '📚',
  },
  {
    title: 'Pinjam & Kembalikan',
    description: 'Pinjam buku dalam satu klik dan pantau status peminjaman serta tenggat waktu.',
    icon: '🔄',
  },
  {
    title: 'Dashboard Pustakawan',
    description: 'Kelola inventaris, pantau sirkulasi, dan tinjau aktivitas dari satu dashboard.',
    icon: '🛠️',
  },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dark Navbar matching Academic Clean theme */}
      <header className="app-navbar">
        <div className="brand">
          <span>📚</span>
          <span>Perpustakaan Universitas XYZ</span>
        </div>
        <nav style={{ display: 'flex', gap: '0.75rem' }}>
          {user ? (
            <Link
              to="/home"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Masuk Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{ padding: '6px 16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="btn-success"
                style={{ textDecoration: 'none' }}
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            textAlign: 'center',
            padding: '5rem 1.5rem 4rem',
            background: 'linear-gradient(180deg, var(--bg-color) 0%, #ffffff 100%)',
          }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, maxWidth: 720, marginInline: 'auto', lineHeight: 1.15, color: 'var(--primary-color)' }}>
            Sistem Perpustakaan Digital Universitas XYZ
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, margin: '1.25rem auto 2rem' }}>
            Temukan, pinjam, dan kelola buku dengan mudah melalui Library Management System.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/home' : '/register'}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '1.05rem', textDecoration: 'none', borderRadius: 'var(--radius)' }}
            >
              {user ? 'Buka Dashboard' : 'Mulai Sekarang'}
            </Link>
            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '12px 28px', fontSize: '1.05rem', textDecoration: 'none', borderRadius: 'var(--radius)' }}
            >
              Masuk
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section style={{ maxWidth: 1024, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{ padding: '1.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--surface-color)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.9rem' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Perpustakaan Universitas XYZ. All rights reserved.
      </footer>
    </div>
  )
}
