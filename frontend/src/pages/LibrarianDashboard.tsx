import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllBorrows,
  processBorrowRequests,
  scanReturn,
} from '../api/borrows'
import type { BorrowRecord } from '../types/borrow'

export default function LibrarianDashboard() {
  const [pending, setPending] = useState<BorrowRecord[]>([])
  const [active, setActive] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [returnId, setReturnId] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pendingData, activeData] = await Promise.all([
        getAllBorrows('pending', 1, 50),
        getAllBorrows('approved', 1, 50),
      ])
      setPending(pendingData.items)
      setActive(activeData.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAction = async (
    requestId: string,
    action: 'approve' | 'reject',
  ) => {
    setMessage(null)
    setError(null)
    let reason: string | undefined
    if (action === 'reject') {
      reason = globalThis.prompt('Alasan penolakan:') || undefined
      if (!reason) {
        setError('Alasan penolakan wajib diisi.')
        return
      }
    }
    try {
      await processBorrowRequests([{ request_id: requestId, action, reason }])
      setMessage(`Request ${action === 'approve' ? 'disetujui' : 'ditolak'}.`)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleReturn = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)
    if (!returnId.trim()) return
    try {
      const result = await scanReturn(returnId.trim())
      setMessage(
        result.days_late > 0
          ? `${result.message} (terlambat ${result.days_late} hari)`
          : result.message,
      )
      setReturnId('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Return failed')
    }
  }

  return (
    <div className="librarian-dashboard">
      {/* Sidebar with metrics widgets — ported from Phase 04 "Sidebar & Widget" layout */}
      <aside className="dashboard-sidebar">
        <div className="metrics-widget">
          <h3>Menunggu</h3>
          <p>{pending.length}</p>
        </div>
        <div className="metrics-widget">
          <h3>Aktif</h3>
          <p>{active.length}</p>
        </div>
        <div className="metrics-widget">
          <h3>Total</h3>
          <p>{pending.length + active.length}</p>
        </div>
        <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          ← Beranda
        </Link>
      </aside>

      {/* Main content area */}
      <main className="dashboard-main">
        <h1 style={styles.title}>Dashboard Pustakawan</h1>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        {loading && <p>Memuat...</p>}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Permintaan Menunggu ({pending.length})</h2>
        {pending.length === 0 && <p style={styles.empty}>Tidak ada permintaan menunggu.</p>}
        {pending.map((req) => (
          <div key={req.id} style={styles.row}>
            <div>
              <strong>Buku:</strong> {req.book_id.slice(0, 8)}...{' '}
              <span style={styles.muted}>oleh {req.user_id.slice(0, 8)}...</span>
            </div>
            <div className="actions-bar">
              <button className="btn-success" onClick={() => handleAction(req.id, 'approve')}>
                Setujui
              </button>
              <button className="btn-danger" onClick={() => handleAction(req.id, 'reject')}>
                Tolak
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pemrosesan Pengembalian</h2>
        <form style={styles.returnForm} onSubmit={handleReturn}>
          <input
            style={styles.input}
            type="text"
            placeholder="ID Peminjaman (loan ID)"
            value={returnId}
            onChange={(e) => setReturnId(e.target.value)}
          />
          <button type="submit" className="btn-primary">Proses Pengembalian</button>
        </form>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Peminjaman Aktif ({active.length})</h2>
        {active.length === 0 && <p style={styles.empty}>Tidak ada peminjaman aktif.</p>}
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Peminjaman</th>
              <th>Buku</th>
              <th className="hide-on-mobile">Jatuh Tempo</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {active.map((loan) => (
              <tr key={loan.id}>
                <td><code style={styles.code}>{loan.id.slice(0, 8)}...</code></td>
                <td>Buku {loan.book_id.slice(0, 8)}...</td>
                <td className="hide-on-mobile">{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => setReturnId(loan.id)}>
                    Pilih untuk kembali
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: '1.5rem', margin: '0 0 1rem 0' },
  success: { color: '#166534', background: '#dcfce7', padding: '0.6rem 1rem', borderRadius: '6px' },
  error: { color: '#991b1b', background: '#fee2e2', padding: '0.6rem 1rem', borderRadius: '6px' },
  section: { marginTop: '2rem' },
  sectionTitle: { fontSize: '1.1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' },
  empty: { color: 'var(--text-muted)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', marginBottom: '0.5rem', backgroundColor: 'var(--surface-color)' },
  muted: { color: 'var(--text-muted)', fontSize: '0.85rem' },
  returnForm: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  input: { flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem' },
  code: { background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: '3px' },
}
