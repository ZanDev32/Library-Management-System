from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from backend.app.api.deps import get_db, get_current_librarian
from backend.app.models.borrow import BorrowRequest, BorrowStatus
from backend.app.services.notification import send_status_update_notification

router = APIRouter()

class ProcessAction(BaseModel):
    request_id: int
    action: str  # "APPROVE" or "REJECT"
    reason: Optional[str] = None

class ProcessRequestIn(BaseModel):
    actions: List[ProcessAction]

@router.post("/process")
def process_requests(
    payload: ProcessRequestIn,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_librarian)
):
    results = []
    for item in payload.actions:
        req = db.query(BorrowRequest).filter(BorrowRequest.id == item.request_id).first()
        if not req:
            results.append({"request_id": item.request_id, "status": "error", "message": "Not found"})
            continue
            
        if item.action == "APPROVE":
            req.status = BorrowStatus.APPROVED
            now = datetime.utcnow()
            req.approval_date = now
            req.due_date = now + timedelta(days=14)
            req.pickup_deadline = now + timedelta(days=2)
            
            send_status_update_notification(req.user_id, "APPROVED", "Your book is ready for pickup.")
            results.append({"request_id": item.request_id, "status": "success", "action": "APPROVED"})
            
        elif item.action == "REJECT":
            if not item.reason:
                results.append({"request_id": item.request_id, "status": "error", "message": "Reason is required for rejection"})
                continue
            
            req.status = BorrowStatus.REJECTED
            req.rejection_reason = item.reason
            # Here we would also increment available_copies of the book back up
            
            send_status_update_notification(req.user_id, "REJECTED", f"Your request was rejected. Reason: {item.reason}")
            results.append({"request_id": item.request_id, "status": "success", "action": "REJECTED"})
            
    db.commit()
    return {"results": results}
