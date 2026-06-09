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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Pustakawan</h1>
        <Link to="/" style={styles.backBtn}>← Beranda</Link>
      </div>

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
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => handleAction(req.id, 'approve')}>
                Setujui
              </button>
              <button style={styles.rejectBtn} onClick={() => handleAction(req.id, 'reject')}>
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
          <button type="submit" style={styles.returnBtn}>Proses Pengembalian</button>
        </form>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Peminjaman Aktif ({active.length})</h2>
        {active.length === 0 && <p style={styles.empty}>Tidak ada peminjaman aktif.</p>}
        <table style={styles.table}>
          <tbody>
            {active.map((loan) => (
              <tr key={loan.id}>
                <td style={styles.td}><code style={styles.code}>{loan.id.slice(0, 8)}...</code></td>
                <td style={styles.td}>Buku {loan.book_id.slice(0, 8)}...</td>
                <td style={styles.td}>Jatuh tempo: {loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
                <td style={styles.td}>
                  <button style={styles.smallBtn} onClick={() => setReturnId(loan.id)}>
                    Pilih untuk kembali
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', margin: 0 },
  backBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: '#333', background: '#fff' },
  success: { color: '#166534', background: '#dcfce7', padding: '0.6rem 1rem', borderRadius: '6px' },
  error: { color: '#991b1b', background: '#fee2e2', padding: '0.6rem 1rem', borderRadius: '6px' },
  section: { marginTop: '2rem' },
  sectionTitle: { fontSize: '1.1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' },
  empty: { color: '#9ca3af' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.5rem' },
  muted: { color: '#9ca3af', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  approveBtn: { padding: '0.4rem 0.8rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  rejectBtn: { padding: '0.4rem 0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  returnForm: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  input: { flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' },
  returnBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' },
  td: { padding: '0.5rem', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' },
  code: { background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: '3px' },
  smallBtn: { padding: '0.3rem 0.6rem', background: '#f3f4f6', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
}
