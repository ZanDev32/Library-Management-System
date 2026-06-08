import React, { useState } from 'react';
import BorrowModal from './BorrowModal';

/**
 * BookCard — Displays a book with borrow/waitlist action.
 * Shows "Pinjam" if available, "Masuk Antrian" if all copies are borrowed.
 */
export default function BookCard({ book, onBorrowSuccess }) {
  const [showModal, setShowModal] = useState(false);

  const isAvailable = book.available_copies > 0;

  return (
    <div className="book-card" id={`book-card-${book.id}`}>
      <div className="book-card-cover">
        <img src={book.cover_url || '/placeholder-cover.png'} alt={book.title} />
      </div>
      <div className="book-card-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-isbn">ISBN: {book.isbn}</p>
        <p className={`book-availability ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable
            ? `${book.available_copies} copy tersedia`
            : 'Semua copy dipinjam'}
        </p>
      </div>
      <button
        className={isAvailable ? 'btn-primary' : 'btn-waitlist'}
        onClick={() => setShowModal(true)}
        id={`borrow-btn-${book.id}`}
      >
        {isAvailable ? 'Pinjam' : 'Masuk Antrian'}
      </button>

      {showModal && (
        <BorrowModal
          book={book}
          onClose={() => setShowModal(false)}
          onSuccess={(data) => {
            setShowModal(false);
            onBorrowSuccess?.(data);
          }}
        />
      )}
    </div>
  );
}
