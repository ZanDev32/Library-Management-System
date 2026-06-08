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
