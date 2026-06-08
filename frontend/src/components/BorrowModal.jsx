import React, { useState } from 'react';

/**
 * BorrowModal — Step 2 of the 2-step borrow flow.
 * Displays book info and estimated due date, then submits the borrow request.
 *
 * Props:
 *   book       — { id, title, author, available_copies }
 *   onClose    — callback to close the modal
 *   onSuccess  — callback after successful request
 */
export default function BorrowModal({ book, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isWaitlist = book.available_copies <= 0;

  // Estimated due date: 14 days from today (informational only — backend calculates real date on approval)
  const estimatedDue = new Date();
  estimatedDue.setDate(estimatedDue.getDate() + 14);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isWaitlist ? '/api/borrow/waitlist' : '/api/borrow/request';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: book.id }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      onSuccess?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isWaitlist ? 'Masuk Antrian' : 'Konfirmasi Peminjaman'}</h2>

        <div className="modal-body">
          <p><strong>Judul:</strong> {book.title}</p>
          <p><strong>Penulis:</strong> {book.author}</p>
          {!isWaitlist && (
            <p><strong>Estimasi Jatuh Tempo:</strong> {estimatedDue.toLocaleDateString('id-ID')}</p>
          )}
          {isWaitlist && (
            <p className="waitlist-note">
              Semua copy sedang dipinjam. Anda akan masuk ke antrian dan diberi tahu saat buku tersedia.
            </p>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Mengirim...' : isWaitlist ? 'Masuk Antrian' : 'Konfirmasi Pinjam'}
          </button>
        </div>
      </div>
    </div>
  );
}
