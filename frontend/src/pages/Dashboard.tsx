import { useEffect, useState } from 'react'
import { fetchDashboardMetrics } from '../services/dashboard'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardMetrics()
      .then(setMetrics)
      .catch(() => setError('Failed to load dashboard metrics.'))
  }, [])

  if (error) return <div className="card"><p style={{ color: 'red' }}>{error}</p></div>
  if (!metrics) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h2>Librarian Dashboard</h2>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: '#fff' }}>
          <h3>Total Books</h3>
          <p style={{ fontSize: 24 }}>{metrics.total_books}</p>
        </div>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: '#fff' }}>
          <h3>Active Loans</h3>
          <p style={{ fontSize: 24 }}>{metrics.active_loans}</p>
        </div>
        <div style={{ flex: 1, padding: 16, borderRadius: 8, background: '#fff' }}>
          <h3>Overdue Loans</h3>
          <p style={{ fontSize: 24, color: metrics.overdue_loans ? 'crimson' : 'inherit' }}>{metrics.overdue_loans}</p>
        </div>
      </div>
    </div>
  )
}
