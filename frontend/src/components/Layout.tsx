import type { ReactNode } from 'react'
import Navbar from './Navbar'

/**
 * Shared page layout with the dark top navbar and centered page content.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="page-content" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  )
}
