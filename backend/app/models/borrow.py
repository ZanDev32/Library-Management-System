from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class BorrowStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PICKED_UP = "PICKED_UP"
    RETURNED = "RETURNED"
    CANCELLED = "CANCELLED"

class WaitlistStatus(str, Enum):
    WAITING = "WAITING"
    FULFILLED = "FULFILLED"
    CANCELLED = "CANCELLED"

class ExtensionStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class BorrowRequest(Base):
    __tablename__ = "borrow_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False) # Foreign Key to User
    book_id = Column(Integer, index=True, nullable=False) # Foreign Key to Book
    status = Column(SQLEnum(BorrowStatus), default=BorrowStatus.PENDING, nullable=False)
    
    request_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    approval_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    return_date = Column(DateTime, nullable=True)
    pickup_deadline = Column(DateTime, nullable=True)
    
    rejection_reason = Column(String, nullable=True)

class Waitlist(Base):
    __tablename__ = "waitlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    book_id = Column(Integer, index=True, nullable=False)
    
    request_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(WaitlistStatus), default=WaitlistStatus.WAITING, nullable=False)

class ExtensionRequest(Base):
    __tablename__ = "extension_requests"

    id = Column(Integer, primary_key=True, index=True)
    borrow_request_id = Column(Integer, ForeignKey("borrow_requests.id"), nullable=False)
    status = Column(SQLEnum(ExtensionStatus), default=ExtensionStatus.PENDING, nullable=False)
    request_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    borrow_request = relationship("BorrowRequest")
