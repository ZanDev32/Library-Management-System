from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from backend.app.api.deps import get_db, get_current_student
from backend.app.models.borrow import BorrowRequest, BorrowStatus, Waitlist, WaitlistStatus, ExtensionRequest, ExtensionStatus

router = APIRouter()

class BorrowRequestIn(BaseModel):
    book_id: int

@router.post("/request", response_model=Any)
def request_borrow(
    req: BorrowRequestIn,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_student)
):
    # In a real app we'd fetch the Book from db and check available_copies.
    # We will mock the check here for structural completeness.
    # book = db.query(Book).filter(Book.id == req.book_id).first()
    # if not book: raise HTTPException(404)
    # if book.available_copies <= 0: raise HTTPException(400, "Book not available, try waitlisting")
    
    borrow_req = BorrowRequest(
        user_id=current_user["id"],
        book_id=req.book_id,
        status=BorrowStatus.PENDING
    )
    db.add(borrow_req)
    db.commit()
    db.refresh(borrow_req)
    return {"message": "Borrow request submitted", "request_id": borrow_req.id}

@router.post("/waitlist", response_model=Any)
def join_waitlist(
    req: BorrowRequestIn,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_student)
):
    waitlist_req = Waitlist(
        user_id=current_user["id"],
        book_id=req.book_id,
        status=WaitlistStatus.WAITING
    )
    db.add(waitlist_req)
    db.commit()
    db.refresh(waitlist_req)
    return {"message": "Added to waitlist", "waitlist_id": waitlist_req.id}

class ExtensionRequestIn(BaseModel):
    loan_id: int

@router.post("/extend", response_model=Any)
def request_extension(
    req: ExtensionRequestIn,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_student)
):
    borrow_req = db.query(BorrowRequest).filter(
        BorrowRequest.id == req.loan_id, 
        BorrowRequest.user_id == current_user["id"]
    ).first()
    
    if not borrow_req:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    if borrow_req.status not in (BorrowStatus.APPROVED, BorrowStatus.PICKED_UP):
        raise HTTPException(status_code=400, detail="Can only extend active loans")
        
    ext_req = ExtensionRequest(
        borrow_request_id=req.loan_id,
        status=ExtensionStatus.PENDING
    )
    db.add(ext_req)
    db.commit()
    db.refresh(ext_req)
    return {"message": "Extension request submitted", "extension_id": ext_req.id}

