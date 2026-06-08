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

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    created_at: Optional[str]

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None
