import os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .database import engine, ensure_database_exists, get_db
from .models import Base
from .schemas import UserCreate, UserResponse, Token, BookCreate, BookUpdate, BookResponse, BookListResponse
from .auth import (
    get_current_user,
    require_librarian,
    verify_password,
    get_password_hash,
    create_access_token,
)
from .crud import create_user, get_user_by_email, get_book, get_books, create_book, update_book, delete_book

app = FastAPI(title='Library Management System API')

origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
async def on_startup():
    await ensure_database_exists()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.post('/auth/register', response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
    hashed_password = get_password_hash(user.password)
    created = await create_user(db, user, hashed_password)
    if created is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Failed to create user')
    return created


@app.post('/auth/login', response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect email or password', headers={'WWW-Authenticate': 'Bearer'})
    access_token = create_access_token(data={'sub': user.email, 'role': user.role})
    return {'access_token': access_token, 'token_type': 'bearer'}


@app.get('/users/me', response_model=UserResponse)
async def read_users_me(current_user=Depends(get_current_user)):
    return current_user


@app.get('/books', response_model=BookListResponse)
async def list_books(
    q: str | None = None,
    author: str | None = None,
    isbn: str | None = None,
    available: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20
    skip = (page - 1) * page_size
    books, total = await get_books(db, q=q, author=author, isbn=isbn, available=available, skip=skip, limit=page_size)
    return {
        'items': books,
        'total': total,
        'page': page,
        'page_size': page_size,
    }


@app.post('/books', response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def add_book(book: BookCreate, current_user=Depends(require_librarian), db: AsyncSession = Depends(get_db)):
    created = await create_book(db, book)
    if created is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Failed to create book')
    return created


@app.get('/books/{book_id}', response_model=BookResponse)
async def read_book(book_id: int, db: AsyncSession = Depends(get_db)):
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Book not found')
    return book


@app.put('/books/{book_id}', response_model=BookResponse)
async def edit_book(book_id: int, book_update: BookUpdate, current_user=Depends(require_librarian), db: AsyncSession = Depends(get_db)):
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Book not found')
    updated = await update_book(db, book, book_update)
    return updated


@app.delete('/books/{book_id}', status_code=status.HTTP_204_NO_CONTENT)
async def remove_book(book_id: int, current_user=Depends(require_librarian), db: AsyncSession = Depends(get_db)):
    book = await get_book(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Book not found')
    await delete_book(db, book)
    return None


@app.get('/health')
async def health_check():
    return {'status': 'ok'}
