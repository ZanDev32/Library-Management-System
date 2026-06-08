import os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .database import engine, get_db
from .models import Base
from .schemas import UserCreate, UserResponse, Token
from .auth import (
    get_current_user,
    require_librarian,
    verify_password,
    get_password_hash,
    create_access_token,
)
from .crud import create_user, get_user_by_email

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


@app.get('/health')
async def health_check():
    return {'status': 'ok'}
