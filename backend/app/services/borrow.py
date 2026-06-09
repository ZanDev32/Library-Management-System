import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import Book
from app.models.borrow import BorrowRecord
from app.models.user import User


async def create_borrow_request(
    db: AsyncSession, user: User, book_id: uuid.UUID
) -> BorrowRecord:
    # Check book exists and is available
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalars().first()
    if not book:
        raise ValueError("Book not found")
    if book.available_quantity <= 0:
        raise ValueError("Book not available for borrowing")

    # Check if user already has a pending/active borrow for this book
    existing = await db.execute(
        select(BorrowRecord).where(
            BorrowRecord.user_id == user.id,
            BorrowRecord.book_id == book_id,
            BorrowRecord.status.in_(["pending", "approved"]),
        )
    )
    if existing.scalars().first():
        raise ValueError("You already have an active request for this book")

    record = BorrowRecord(
        user_id=user.id,
        book_id=book_id,
        status="pending",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def approve_borrow(
    db: AsyncSession, request_id: uuid.UUID
) -> BorrowRecord:
    result = await db.execute(
        select(BorrowRecord).where(BorrowRecord.id == request_id)
    )
    record = result.scalars().first()
    if not record:
        raise ValueError("Borrow request not found")
    if record.status != "pending":
        raise ValueError("Can only approve pending requests")

    # Decrement available quantity
    book_result = await db.execute(
        select(Book).where(Book.id == record.book_id)
    )
    book = book_result.scalars().first()
    if not book or book.available_quantity <= 0:
        raise ValueError("Book no longer available")

    book.available_quantity -= 1
    record.status = "approved"
    record.borrow_date = datetime.now(timezone.utc)
    record.due_date = datetime.now(timezone.utc) + timedelta(days=14)

    db.add(record)
    db.add(book)
    await db.commit()
    await db.refresh(record)
    return record


async def reject_borrow(
    db: AsyncSession, request_id: uuid.UUID, reason: str | None = None
) -> BorrowRecord:
    result = await db.execute(
        select(BorrowRecord).where(BorrowRecord.id == request_id)
    )
    record = result.scalars().first()
    if not record:
        raise ValueError("Borrow request not found")
    if record.status != "pending":
        raise ValueError("Can only reject pending requests")

    record.status = "rejected"
    # Store reason in updated_at metadata for now (could add rejection_reason column later)
    _ = reason  # Acknowledged — reserved for notification/logging use
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def return_book(
    db: AsyncSession, loan_id: uuid.UUID
) -> tuple[BorrowRecord, int]:
    result = await db.execute(
        select(BorrowRecord).where(BorrowRecord.id == loan_id)
    )
    record = result.scalars().first()
    if not record:
        raise ValueError("Loan not found")
    if record.status != "approved":
        raise ValueError("Book is not currently borrowed")

    now = datetime.now(timezone.utc)
    record.status = "returned"
    record.return_date = now

    # Calculate overdue days
    days_late = 0
    if record.due_date and now > record.due_date:
        delta = now - record.due_date
        days_late = max(1, delta.days)

    # Increment available quantity
    book_result = await db.execute(
        select(Book).where(Book.id == record.book_id)
    )
    book = book_result.scalars().first()
    if book:
        book.available_quantity += 1
        db.add(book)

    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record, days_late


async def get_user_borrows(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    status: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[BorrowRecord], int]:
    query = select(BorrowRecord).where(BorrowRecord.user_id == user_id)
    if status:
        query = query.where(BorrowRecord.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(
        query.order_by(BorrowRecord.created_at.desc()).offset(skip).limit(limit)
    )
    return list(result.scalars().all()), total


async def get_all_borrows(
    db: AsyncSession,
    *,
    status: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[BorrowRecord], int]:
    query = select(BorrowRecord)
    if status:
        query = query.where(BorrowRecord.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(
        query.order_by(BorrowRecord.created_at.desc()).offset(skip).limit(limit)
    )
    return list(result.scalars().all()), total
