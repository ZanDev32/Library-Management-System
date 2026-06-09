import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


async def get_book(db: AsyncSession, book_id: uuid.UUID) -> Book | None:
    result = await db.execute(select(Book).where(Book.id == book_id))
    return result.scalars().first()


async def get_books(
    db: AsyncSession,
    *,
    q: str | None = None,
    author: str | None = None,
    isbn: str | None = None,
    available: bool | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Book], int]:
    query = select(Book)

    if q:
        pattern = f"%{q}%"
        query = query.where(
            or_(
                Book.title.ilike(pattern),
                Book.author.ilike(pattern),
                Book.isbn.ilike(pattern),
            )
        )

    if author:
        query = query.where(Book.author.ilike(f"%{author}%"))

    if isbn:
        query = query.where(Book.isbn.ilike(f"%{isbn}%"))

    if available is not None:
        if available:
            query = query.where(Book.available_quantity > 0)
        else:
            query = query.where(Book.available_quantity == 0)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(query.offset(skip).limit(limit))
    return list(result.scalars().all()), total


async def create_book(db: AsyncSession, data: BookCreate) -> Book | None:
    book = Book(
        title=data.title,
        author=data.author,
        isbn=data.isbn,
        publisher=data.publisher,
        year=data.year,
        quantity=data.quantity,
        available_quantity=data.quantity,
    )
    db.add(book)
    try:
        await db.commit()
        await db.refresh(book)
    except IntegrityError:
        await db.rollback()
        return None
    return book


async def update_book(
    db: AsyncSession, book: Book, data: BookUpdate
) -> Book:
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(book, field, value)
    # If quantity was updated, recalculate available_quantity
    if "quantity" in updates:
        borrowed = book.quantity - book.available_quantity
        book.available_quantity = max(0, updates["quantity"] - borrowed)
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book


async def delete_book(db: AsyncSession, book: Book) -> None:
    await db.delete(book)
    await db.commit()
