import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBorrows } from '../api/borrows'
import type { BorrowRecord } from '../types/borrow'

export default function MyLoans() {
  const [loans, setLoans] = useState<BorrowRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMyBorrows(statusFilter || undefined, page, pageSize)
        setLoans(data.items)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load loans')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, statusFilter])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const statusColor = (s: string): React.CSSProperties => {
    switch (s) {
      case 'approved': return { background: '#dcfce7', color: '#166534' }
      case 'pending': return { background: '#fef9c3', color: '#854d0e' }
      case 'returned': return { background: '#e0f2fe', color: '#0369a1' }
      case 'rejected': return { background: '#fee2e2', color: '#991b1b' }
      case 'overdue': return { background: '#fee2e2', color: '#991b1b' }
      default: return { background: '#f3f4f6', color: '#374151' }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Peminjaman Saya</h1>
        <Link to="/" style={styles.backBtn}>← Beranda</Link>
      </div>

      <div style={styles.filters}>
        <select style={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Dipinjam</option>
          <option value="returned">Dikembalikan</option>
          <option value="rejected">Ditolak</option>
          <option value="overdue">Terlambat</option>
        </select>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && loans.length === 0 && <p>Belum ada peminjaman.</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Buku</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Tanggal Pinjam</th>
            <th style={styles.th}>Jatuh Tempo</th>
            <th style={styles.th}>Dikembalikan</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td style={styles.td}>
                <Link to={`/books/${loan.book_id}`} style={{ color: '#2563eb' }}>
                  {loan.book_id.slice(0, 8)}...
                </Link>
              </td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, ...statusColor(loan.status) }}>
                  {loan.status}
                </span>
              </td>
              <td style={styles.td}>{loan.borrow_date ? new Date(loan.borrow_date).toLocaleDateString('id-ID') : '-'}</td>
              <td style={styles.td}>{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
              <td style={styles.td}>{loan.return_date ? new Date(loan.return_date).toLocaleDateString('id-ID') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button style={styles.pageBtn} onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1}>
          ← Sebelumnya
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button style={styles.pageBtn} onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages}>
          Selanjutnya →
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: 'system-ui, sans-serif', padding: '1rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', margin: 0 },
  backBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: '#333', background: '#fff' },
  filters: { marginBottom: '1rem' },
  select: { padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  error: { color: '#dc2626' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.6rem', borderBottom: '2px solid #e5e7eb', fontSize: '0.85rem', color: '#6b7280' },
  td: { padding: '0.6rem', borderBottom: '1px solid #f3f4f6' },
  badge: { fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', textTransform: 'capitalize' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { padding: '0.4rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' },
}
