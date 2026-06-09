import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBorrows } from '../api/borrows'
import type { BorrowRecord } from '../types/borrow'
import Layout from '../components/Layout'

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

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={styles.header}>
          <h1 className="page-title">📋 Peminjaman Saya</h1>
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

        {!loading && loans.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Belum ada peminjaman.</p>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Buku</th>
              <th>Status</th>
              <th className="hide-on-mobile">Tanggal Pinjam</th>
              <th className="hide-on-mobile">Jatuh Tempo</th>
              <th className="hide-on-mobile">Dikembalikan</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>
                  <Link to={`/books/${loan.book_id}`} style={{ color: 'var(--primary-color)' }}>
                    {loan.book_id.slice(0, 8)}...
                  </Link>
                </td>
                <td>
                  <span className={`status-pill ${loan.status.toLowerCase()}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="hide-on-mobile">{loan.borrow_date ? new Date(loan.borrow_date).toLocaleDateString('id-ID') : '-'}</td>
                <td className="hide-on-mobile">{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
                <td className="hide-on-mobile">{loan.return_date ? new Date(loan.return_date).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.pagination}>
          <button className="btn-secondary" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1}>
            ← Sebelumnya
          </button>
          <span>Halaman {page} dari {totalPages}</span>
          <button className="btn-secondary" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages}>
            Selanjutnya →
          </button>
        </div>
      </div>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: { marginBottom: '1.5rem' },
  filters: { marginBottom: '1rem' },
  select: { padding: '0.5rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem' },
  error: { color: 'var(--danger-color)' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
}
