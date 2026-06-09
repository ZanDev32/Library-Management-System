import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_librarian
from app.models.user import User
from app.schemas.borrow import (
    BorrowBatchProcess,
    BorrowListResponse,
    BorrowRequest,
    BorrowResponse,
    ReturnResponse,
    ReturnScan,
)
from app.services.borrow import (
    approve_borrow,
    create_borrow_request,
    get_all_borrows,
    get_user_borrows,
    reject_borrow,
    return_book,
)

router = APIRouter(prefix="/borrows", tags=["borrows"])


@router.post("/request", response_model=BorrowResponse, status_code=status.HTTP_201_CREATED)
async def request_borrow(
    data: BorrowRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> BorrowResponse:
    try:
        record = await create_borrow_request(db, current_user, data.book_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return record  # type: ignore[return-value]


@router.get("/my", response_model=BorrowListResponse)
async def my_borrows(
    borrow_status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> BorrowListResponse:
    skip = (page - 1) * page_size
    items, total = await get_user_borrows(
        db, current_user.id, status=borrow_status, skip=skip, limit=page_size
    )
    return BorrowListResponse(items=items, total=total, page=page, page_size=page_size)  # type: ignore[arg-type]


@router.get("", response_model=BorrowListResponse)
async def list_all_borrows(
    borrow_status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> BorrowListResponse:
    skip = (page - 1) * page_size
    items, total = await get_all_borrows(
        db, status=borrow_status, skip=skip, limit=page_size
    )
    return BorrowListResponse(items=items, total=total, page=page, page_size=page_size)  # type: ignore[arg-type]


@router.post("/process")
async def process_requests(
    payload: BorrowBatchProcess,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> dict:
    results = []
    for item in payload.actions:
        try:
            if item.action == "approve":
                await approve_borrow(db, item.request_id)
                results.append({"request_id": str(item.request_id), "status": "success", "action": "approved"})
            elif item.action == "reject":
                await reject_borrow(db, item.request_id, item.reason)
                results.append({"request_id": str(item.request_id), "status": "success", "action": "rejected"})
            else:
                results.append({"request_id": str(item.request_id), "status": "error", "message": "Invalid action"})
        except ValueError as e:
            results.append({"request_id": str(item.request_id), "status": "error", "message": str(e)})
    return {"results": results}


@router.post("/return", response_model=ReturnResponse)
async def scan_return(
    data: ReturnScan,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_librarian),
) -> ReturnResponse:
    try:
        _, days_late = await return_book(db, data.loan_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return ReturnResponse(message="Book returned successfully", days_late=days_late)
