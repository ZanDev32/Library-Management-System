from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=128), nullable=False)
    email = Column(String(length=256), nullable=False, unique=True, index=True)
    hashed_password = Column(String(length=256), nullable=False)
    role = Column(String(length=32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(length=256), nullable=False, index=True)
    author = Column(String(length=256), nullable=False, index=True)
    isbn = Column(String(length=32), nullable=False, unique=True, index=True)
    genre = Column(String(length=128), nullable=False)
    publisher = Column(String(length=256), nullable=False)
    publication_year = Column(Integer, nullable=False)
    stock_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False)

    @property
    def available(self) -> bool:
        return self.stock_count > 0
