import { request } from './auth'

export interface DashboardMetrics {
  total_books: number
  total_users: number
  active_loans: number
  overdue_loans: number
}

export function fetchDashboardMetrics() {
  return request('/admin/metrics') as Promise<DashboardMetrics>
}
