import React from 'react';

/**
 * ActiveLoansTable — Librarian UI to view active loans and mark as picked up.
 */
export default function ActiveLoansTable({ loans, onStatusChange }) {
  const handleMarkPickedUp = async (loanId) => {
    try {
      const res = await fetch(`/api/librarian/requests/${loanId}/pickup`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Gagal menandai buku telah diambil');
      onStatusChange?.();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loans.length === 0) {
    return <p className="empty-state">Tidak ada pinjaman aktif.</p>;
  }

  return (
    <div className="active-loans">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mahasiswa</th>
            <th>Buku</th>
            <th>Status</th>
            <th className="hide-on-mobile">Batas Ambil</th>
            <th>Jatuh Tempo</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.user_name || `User #${loan.user_id}`}</td>
              <td>{loan.book_title || `Book #${loan.book_id}`}</td>
              <td>
                <span className={`status-badge status-${loan.status.toLowerCase()}`}>
                  {loan.status}
                </span>
              </td>
              <td className="hide-on-mobile">{loan.pickup_deadline ? new Date(loan.pickup_deadline).toLocaleDateString('id-ID') : '-'}</td>
              <td>{loan.due_date ? new Date(loan.due_date).toLocaleDateString('id-ID') : '-'}</td>
              <td>
                {loan.status === 'APPROVED' && (
                  <button 
                    className="btn-sm btn-primary"
                    onClick={() => handleMarkPickedUp(loan.id)}
                  >
                    Tandai Diambil
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
