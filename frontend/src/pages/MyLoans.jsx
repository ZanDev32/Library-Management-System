import React, { useState, useEffect } from 'react';
import QRCodeDisplay from '../components/QRCodeDisplay';

/**
 * MyLoans — Student dashboard showing active loans, pending requests, and history.
 */

const STATUS_LABELS = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PICKED_UP: 'Sedang Dipinjam',
  RETURNED: 'Dikembalikan',
  CANCELLED: 'Dibatalkan',
};

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoanQR, setSelectedLoanQR] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/borrow/my-loans');
      if (!res.ok) throw new Error('Gagal memuat data pinjaman');
      const data = await res.json();
      setLoans(data.loans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestExtension = async (loanId) => {
    try {
      const res = await fetch('/api/borrow/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId }),
      });
      if (!res.ok) throw new Error('Gagal mengajukan perpanjangan');
      alert('Permintaan perpanjangan berhasil diajukan!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Memuat data pinjaman...</div>;
  if (error) return <div className="error-text">{error}</div>;

  const activeLoans = loans.filter((l) => ['APPROVED', 'PICKED_UP'].includes(l.status));
  const pendingLoans = loans.filter((l) => l.status === 'PENDING');
  const historyLoans = loans.filter((l) => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(l.status));

  return (
    <div className="my-loans-page" id="my-loans-page">
      <h1>Pinjaman Saya</h1>

      {/* Active Loans */}
      <section className="loans-section">
        <h2>Pinjaman Aktif ({activeLoans.length})</h2>
        {activeLoans.length === 0 ? (
          <p className="empty-state">Tidak ada pinjaman aktif.</p>
        ) : (
          <table className="loans-table" id="active-loans-table">
            <thead>
              <tr>
                <th>Buku</th>
                <th>Status</th>
                <th>Jatuh Tempo</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book_title || `Book #${loan.book_id}`}</td>
                  <td><span className={`status-badge status-${loan.status.toLowerCase()}`}>{STATUS_LABELS[loan.status]}</span></td>
                  <td>{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
                  <td>
                    <button className="btn-sm btn-qr" onClick={() => setSelectedLoanQR(loan.id)}>
                      Tampilkan QR
                    </button>
                    <button className="btn-sm btn-extend" onClick={() => requestExtension(loan.id)}>
                      Perpanjang
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* QR Code Modal */}
      {selectedLoanQR && (
        <div className="modal-overlay" onClick={() => setSelectedLoanQR(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>QR Code Pengembalian</h2>
            <QRCodeDisplay loanId={selectedLoanQR} />
            <button className="btn-secondary" onClick={() => setSelectedLoanQR(null)}>Tutup</button>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <section className="loans-section">
        <h2>Permintaan Pending ({pendingLoans.length})</h2>
        {pendingLoans.length === 0 ? (
          <p className="empty-state">Tidak ada permintaan pending.</p>
        ) : (
          <table className="loans-table" id="pending-loans-table">
            <thead>
              <tr><th>Buku</th><th>Tanggal Request</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pendingLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book_title || `Book #${loan.book_id}`}</td>
                  <td>{new Date(loan.request_date).toLocaleDateString('id-ID')}</td>
                  <td><span className="status-badge status-pending">{STATUS_LABELS[loan.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* History */}
      <section className="loans-section">
        <h2>Riwayat ({historyLoans.length})</h2>
        {historyLoans.length === 0 ? (
          <p className="empty-state">Belum ada riwayat.</p>
        ) : (
          <table className="loans-table" id="history-loans-table">
            <thead>
              <tr><th>Buku</th><th>Status</th><th>Tanggal</th></tr>
            </thead>
            <tbody>
              {historyLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book_title || `Book #${loan.book_id}`}</td>
                  <td><span className={`status-badge status-${loan.status.toLowerCase()}`}>{STATUS_LABELS[loan.status]}</span></td>
                  <td>{loan.return_date ? new Date(loan.return_date).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
