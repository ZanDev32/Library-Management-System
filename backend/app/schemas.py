from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr

class Role(str, Enum):
    student = 'student'
    librarian = 'librarian'

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role

from datetime import datetime

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None

class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    genre: str
    publisher: str
    publication_year: int
    stock_count: int

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    stock_count: Optional[int] = None

    class Config:
        from_attributes = True

class BookResponse(BookBase):
    id: int
    available: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    page_size: int
