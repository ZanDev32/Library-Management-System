import React, { useState } from 'react';

/**
 * QRScanner — Mock QR scanner for librarian to process returns.
 * In a real app, this would use html5-qrcode or similar to access the camera.
 * Here we provide a manual input to simulate scanning a loan ID.
 */
export default function QRScanner({ onScanSuccess }) {
  const [manualId, setManualId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!manualId) return;

    setLoading(true);
    setMessage('');
    
    try {
      // In a real app, the QR code value might be "LMS-LOAN-123". We extract the ID.
      let loanIdStr = manualId;
      if (manualId.startsWith('LMS-LOAN-')) {
        loanIdStr = manualId.replace('LMS-LOAN-', '');
      }
      
      const loanId = parseInt(loanIdStr, 10);
      if (isNaN(loanId)) throw new Error('Format QR tidak valid');

      const res = await fetch('/api/librarian/returns/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Gagal memproses pengembalian');
      }

      const data = await res.json();
      setMessage(`Berhasil: ${data.message} (${data.days_late} hari terlambat)`);
      setManualId('');
      onScanSuccess?.();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-scanner-container">
      <h3>Scanner Pengembalian Buku</h3>
      <p className="scanner-instruction">
        Arahkan kamera ke QR code mahasiswa, atau masukkan ID Pinjaman secara manual untuk simulasi.
      </p>
      
      <div className="scanner-placeholder">
        [ Area Kamera Scanner ]
      </div>

      <form onSubmit={handleScan} className="manual-scan-form">
        <input 
          type="text" 
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Masukkan ID (contoh: LMS-LOAN-1)"
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !manualId}>
          Simulasi Scan
        </button>
      </form>

      {message && (
        <div className={`scan-message ${message.startsWith('Error') ? 'error-text' : 'success-text'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
