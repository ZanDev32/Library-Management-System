from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, or_

from .models import User, Book
from .schemas import UserCreate, BookCreate, BookUpdate

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate, hashed_password: str):
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role.value,
    )
    db.add(db_user)
    try:
        await db.commit()
        await db.refresh(db_user)
    except IntegrityError:
        await db.rollback()
        return None
    return db_user

async def get_book(db: AsyncSession, book_id: int):
    result = await db.execute(select(Book).where(Book.id == book_id))
    return result.scalars().first()

async def get_books(
    db: AsyncSession,
    q: str | None = None,
    author: str | None = None,
    isbn: str | None = None,
    available: bool | None = None,
    skip: int = 0,
    limit: int = 20,
):
    query = select(Book)

    if q:
        pattern = f'%{q}%'
        query = query.where(
            or_(
                Book.title.ilike(pattern),
                Book.author.ilike(pattern),
                Book.isbn.ilike(pattern),
            )
        )

    if author:
        query = query.where(Book.author.ilike(f'%{author}%'))

    if isbn:
        query = query.where(Book.isbn.ilike(f'%{isbn}%'))

    if available is not None:
        if available:
            query = query.where(Book.stock_count > 0)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all(), total

async def create_book(db: AsyncSession, book: BookCreate):
    db_book = Book(
        title=book.title,
        author=book.author,
        isbn=book.isbn,
        genre=book.genre,
        publisher=book.publisher,
        publication_year=book.publication_year,
        stock_count=book.stock_count,
    )
    db.add(db_book)
    try:
        await db.commit()
        await db.refresh(db_book)
    except IntegrityError:
        await db.rollback()
        return None
    return db_book

async def update_book(db: AsyncSession, db_book: Book, book_update: BookUpdate):
    updates = book_update.dict(exclude_unset=True)
    for field, value in updates.items():
        setattr(db_book, field, value)
    db.add(db_book)
    await db.commit()
    await db.refresh(db_book)
    return db_book

async def delete_book(db: AsyncSession, db_book: Book):
    await db.delete(db_book)
    await db.commit()
    return None
