import React, { useState, useEffect } from 'react';
import PendingRequestsTable from '../components/PendingRequestsTable';
import ActiveLoansTable from '../components/ActiveLoansTable';
import QRScanner from '../components/QRScanner';
import '../index.css';

/**
 * LibrarianDashboard — Main dashboard for librarians to manage borrowing.
 */
export default function LibrarianDashboard() {
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ACTIVE, SCANNER
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock API call — in reality, we'd hit different endpoints or filter by status
      const res = await fetch('/api/librarian/requests/all');
      if (!res.ok) {
        // If endpoint doesn't exist yet, we'll mock some data for the UI
        console.warn('API not ready, using mock data');
        setRequests([
          { id: 1, user_id: 1, user_name: 'Budi', book_id: 10, book_title: 'Sistem Basis Data', status: 'PENDING', request_date: new Date() },
          { id: 2, user_id: 2, user_name: 'Siti', book_id: 12, book_title: 'Algoritma', status: 'APPROVED', pickup_deadline: new Date() },
          { id: 3, user_id: 3, user_name: 'Andi', book_id: 15, book_title: 'Jaringan Komputer', status: 'PICKED_UP', due_date: new Date() },
        ]);
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeLoans = requests.filter(r => ['APPROVED', 'PICKED_UP'].includes(r.status));
  const overdueLoans = requests.filter(r => r.status === 'OVERDUE');
  
  // Also calculate from activeLoans if overdue logic relies on due_date dynamically, but usually status = OVERDUE
  const totalActive = activeLoans.length + overdueLoans.length;

  return (
    <div className="librarian-dashboard">
      <aside className="dashboard-sidebar">
        <h2>Perpustakaan</h2>
        <div className="metrics-widget smooth-transition">
          <h3>Pending</h3>
          <p>{pendingRequests.length}</p>
        </div>
        <div className="metrics-widget smooth-transition">
          <h3>Aktif</h3>
          <p>{totalActive}</p>
        </div>
        <div className="metrics-widget smooth-transition" style={{ borderColor: 'var(--danger-color)' }}>
          <h3 style={{ color: 'var(--danger-color)' }}>Overdue</h3>
          <p style={{ color: 'var(--danger-color)' }}>{overdueLoans.length}</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <h1>Dashboard Pustakawan</h1>
        
        <div className="tabs">
          <button 
            className={`tab-btn smooth-transition ${activeTab === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Permintaan ({pendingRequests.length})
          </button>
          <button 
            className={`tab-btn smooth-transition ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            Pinjaman Aktif ({totalActive})
          </button>
          <button 
            className={`tab-btn smooth-transition ${activeTab === 'SCANNER' ? 'active' : ''}`}
            onClick={() => setActiveTab('SCANNER')}
          >
            Scanner
          </button>
        </div>

        <div className="tab-content smooth-transition">
          {loading ? (
            <p>Memuat data...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <>
              {activeTab === 'PENDING' && (
                <PendingRequestsTable 
                  requests={pendingRequests} 
                  onProcessComplete={fetchData} 
                />
              )}
              {activeTab === 'ACTIVE' && (
                <ActiveLoansTable 
                  loans={activeLoans.concat(overdueLoans)} 
                  onStatusChange={fetchData} 
                />
              )}
              {activeTab === 'SCANNER' && (
                <QRScanner onScanSuccess={fetchData} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
