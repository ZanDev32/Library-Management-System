import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_librarian
from app.models.user import User
from app.schemas.book import (
    BookCreate,
    BookListResponse,
    BookResponse,
    BookUpdate,
)
from app.services.book import (
    create_book,
    delete_book,
    get_book,
    get_books,
    update_book,
)

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=BookListResponse)
async def list_books(
    q: str | None = None,
    author: str | None = None,
    isbn: str | None = None,
    available: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> BookListResponse:
    skip = (page - 1) * page_size
    books, total = await get_books(
        db,
        q=q,
        author=author,
        isbn=isbn,
        available=available,
        skip=skip,
        limit=page_size,
    )
    return BookListResponse(
        items=books,  # type: ignore[arg-type]
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def add_book(
    data: BookCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> BookResponse:
    book = await create_book(db, data)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A book with this ISBN already exists",
        )
    return book  # type: ignore[return-value]


@router.get("/{book_id}", response_model=BookResponse)
async def read_book(
    book_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> BookResponse:
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return book  # type: ignore[return-value]


@router.put("/{book_id}", response_model=BookResponse)
async def edit_book(
    book_id: uuid.UUID,
    data: BookUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> BookResponse:
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    updated = await update_book(db, book, data)
    return updated  # type: ignore[return-value]


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_book(
    book_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> None:
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    await delete_book(db, book)
