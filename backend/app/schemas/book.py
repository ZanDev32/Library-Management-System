import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    title: str = Field(..., max_length=300)
    author: str = Field(..., max_length=200)
    isbn: str = Field(..., max_length=20)
    publisher: str | None = Field(default=None, max_length=200)
    year: int | None = None
    quantity: int = Field(default=1, ge=0)


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str | None = Field(default=None, max_length=300)
    author: str | None = Field(default=None, max_length=200)
    isbn: str | None = Field(default=None, max_length=20)
    publisher: str | None = Field(default=None, max_length=200)
    year: int | None = None
    quantity: int | None = Field(default=None, ge=0)


class BookResponse(BookBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    available_quantity: int
    available: bool
    created_at: datetime
    updated_at: datetime | None


class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    page_size: int
