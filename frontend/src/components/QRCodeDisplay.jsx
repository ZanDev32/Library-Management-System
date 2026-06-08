import React from 'react';

/**
 * QRCodeDisplay — Renders a QR code for a given loan ID.
 * Uses a public QR API instead of a library dependency for simplicity.
 * The student shows this QR to the librarian when returning a book.
 */
export default function QRCodeDisplay({ loanId, size = 200 }) {
  const qrValue = `LMS-LOAN-${loanId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="qr-code-display" id={`qr-display-${loanId}`}>
      <img
        src={qrUrl}
        alt={`QR Code for Loan #${loanId}`}
        width={size}
        height={size}
      />
      <p className="qr-label">Loan #{loanId}</p>
      <p className="qr-instruction">Tunjukkan QR ini ke pustakawan saat mengembalikan buku.</p>
    </div>
  );
}
