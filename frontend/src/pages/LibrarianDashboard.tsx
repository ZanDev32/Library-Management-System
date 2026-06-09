import { useState, useEffect, useCallback } from 'react'
import {
  getAllBorrows,
  processBorrowRequests,
  scanReturn,
} from '../api/borrows'
import type { BorrowRecord } from '../types/borrow'
import Layout from '../components/Layout'

type Tab = 'permintaan' | 'aktif' | 'scanner'

export default function LibrarianDashboard() {
  const [pending, setPending] = useState<BorrowRecord[]>([])
  const [active, setActive] = useState<BorrowRecord[]>([])
  const [returned, setReturned] = useState<BorrowRecord[]>([])
  const [overdue, setOverdue] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [returnId, setReturnId] = useState('')
  const [tab, setTab] = useState<Tab>('aktif')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pendingData, activeData, returnedData, overdueData] = await Promise.all([
        getAllBorrows('pending', 1, 50),
        getAllBorrows('approved', 1, 50),
        getAllBorrows('returned', 1, 50),
        getAllBorrows('overdue', 1, 50),
      ])
      setPending(pendingData.items)
      setActive(activeData.items)
      setReturned(returnedData.items)
      setOverdue(overdueData.items)
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
    <Layout>
      <div className="librarian-dashboard" style={{ background: 'transparent', minHeight: 'auto' }}>
        {/* Sidebar with metrics */}
        <aside className="dashboard-sidebar">
          <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: 'var(--primary-color)' }}>📊 Perpustakaan</h3>
          <div className="metrics-widget">
            <h3>PENDING</h3>
            <p>{pending.length}</p>
          </div>
          <div className="metrics-widget">
            <h3>AKTIF</h3>
            <p style={{ color: 'var(--primary-color)' }}>{active.length}</p>
          </div>
          <div className="metrics-widget">
            <h3>OVERDUE</h3>
            <p style={{ color: 'var(--danger-color)' }}>{overdue.length}</p>
          </div>
          <div className="metrics-widget">
            <h3>DIKEMBALIKAN</h3>
            <p style={{ color: 'var(--success-color)' }}>{returned.length}</p>
          </div>
        </aside>

        {/* Main content area */}
        <main className="dashboard-main">
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 16px', color: 'var(--primary-color)' }}>
            Dashboard Pustakawan
          </h1>

          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}
          {loading && <p>Memuat...</p>}

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'permintaan' ? 'active' : ''}`} onClick={() => setTab('permintaan')}>
              Permintaan
            </button>
            <button className={`tab-btn ${tab === 'aktif' ? 'active' : ''}`} onClick={() => setTab('aktif')}>
              Pinjaman Aktif
            </button>
            <button className={`tab-btn ${tab === 'scanner' ? 'active' : ''}`} onClick={() => setTab('scanner')}>
              Scanner
            </button>
          </div>

          {/* Tab: Permintaan */}
          {tab === 'permintaan' && (
            <section>
              {pending.length === 0 && <p style={styles.empty}>Tidak ada permintaan menunggu.</p>}
              {pending.length > 0 && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>MAHASISWA</th>
                      <th>BUKU</th>
                      <th className="hide-on-mobile">TANGGAL</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((req, idx) => (
                      <tr key={req.id}>
                        <td>{idx + 1}</td>
                        <td>{req.user_id.slice(0, 8)}...</td>
                        <td>{req.book_id.slice(0, 8)}...</td>
                        <td className="hide-on-mobile">{req.borrow_date ? new Date(req.borrow_date).toLocaleDateString('id-ID') : '-'}</td>
                        <td>
                          <div className="actions-bar" style={{ marginBottom: 0 }}>
                            <button className="btn-success" onClick={() => handleAction(req.id, 'approve')}>
                              ✅ Setujui
                            </button>
                            <button className="btn-danger" onClick={() => handleAction(req.id, 'reject')}>
                              ❌ Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* Tab: Pinjaman Aktif */}
          {tab === 'aktif' && (
            <section>
              {active.length === 0 && <p style={styles.empty}>Tidak ada peminjaman aktif.</p>}
              {active.length > 0 && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>MAHASISWA</th>
                      <th>BUKU</th>
                      <th>STATUS</th>
                      <th className="hide-on-mobile">BATAS AMBIL</th>
                      <th className="hide-on-mobile">JATUH TEMPO</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((loan, idx) => (
                      <tr key={loan.id}>
                        <td>{idx + 1}</td>
                        <td>{loan.user_id.slice(0, 8)}...</td>
                        <td>{loan.book_id.slice(0, 8)}...</td>
                        <td><span className={`status-pill ${loan.status.toLowerCase()}`}>{loan.status}</span></td>
                        <td className="hide-on-mobile">-</td>
                        <td className="hide-on-mobile">{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
                        <td>
                          <button className="btn-primary" onClick={() => { setReturnId(loan.id); setTab('scanner') }}>
                            📦 Tandai Diambil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* Tab: Scanner */}
          {tab === 'scanner' && (
            <section>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', margin: '0 0 12px' }}>
                Scan Pengembalian
              </h2>
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
          )}
        </main>
      </div>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  success: { color: '#166534', background: '#dcfce7', padding: '0.6rem 1rem', borderRadius: 'var(--radius)' },
  error: { color: '#991b1b', background: '#fee2e2', padding: '0.6rem 1rem', borderRadius: 'var(--radius)' },
  empty: { color: 'var(--text-muted)' },
  returnForm: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  input: { flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem' },
}
