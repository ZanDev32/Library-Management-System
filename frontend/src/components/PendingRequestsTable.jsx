import React, { useState } from 'react';

/**
 * PendingRequestsTable — Librarian UI to batch approve/reject borrow requests.
 */
export default function PendingRequestsTable({ requests, onProcessComplete }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(requests.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const processRequests = async (action, reason = null) => {
    if (selectedIds.size === 0) return;
    
    setLoading(true);
    try {
      const actions = Array.from(selectedIds).map(id => ({
        request_id: id,
        action,
        reason
      }));

      const res = await fetch('/api/librarian/requests/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      });

      if (!res.ok) throw new Error(`Failed to process requests`);
      
      setSelectedIds(new Set());
      setIsRejectModalOpen(false);
      setRejectReason('');
      onProcessComplete?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) {
    return <p className="empty-state">Tidak ada permintaan pending.</p>;
  }

  return (
    <div className="pending-requests">
      <div className="actions-bar">
        <button 
          className="btn-primary" 
          disabled={selectedIds.size === 0 || loading}
          onClick={() => processRequests('APPROVE')}
        >
          Setujui Terpilih ({selectedIds.size})
        </button>
        <button 
          className="btn-danger" 
          disabled={selectedIds.size === 0 || loading}
          onClick={() => setIsRejectModalOpen(true)}
        >
          Tolak Terpilih ({selectedIds.size})
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selectedIds.size === requests.length && requests.length > 0}
                onChange={handleToggleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Mahasiswa</th>
            <th>Buku</th>
            <th className="hide-on-mobile">Tanggal Request</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(req.id)}
                  onChange={() => handleToggleSelect(req.id)}
                />
              </td>
              <td>{req.id}</td>
              <td>{req.user_name || `User #${req.user_id}`}</td>
              <td>{req.book_title || `Book #${req.book_id}`}</td>
              <td className="hide-on-mobile">{new Date(req.request_date).toLocaleDateString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Tolak Permintaan</h2>
            <p>Masukkan alasan penolakan (wajib):</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Buku sedang diperbaiki..."
              required
              rows={4}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsRejectModalOpen(false)} disabled={loading}>Batal</button>
              <button className="btn-danger" onClick={() => processRequests('REJECT', rejectReason)} disabled={loading || !rejectReason.trim()}>
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
