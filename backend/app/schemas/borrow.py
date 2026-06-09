import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BorrowRequest(BaseModel):
    book_id: uuid.UUID


class BorrowApproval(BaseModel):
    request_id: uuid.UUID
    action: str  # "approve" or "reject"
    reason: str | None = None


class BorrowBatchProcess(BaseModel):
    actions: list[BorrowApproval]


class BorrowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    status: str
    borrow_date: datetime | None
    due_date: datetime | None
    return_date: datetime | None
    created_at: datetime
    updated_at: datetime | None


class BorrowListResponse(BaseModel):
    items: list[BorrowResponse]
    total: int
    page: int
    page_size: int


class ReturnScan(BaseModel):
    loan_id: uuid.UUID


class ReturnResponse(BaseModel):
    message: str
    days_late: int
