from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.app.models.borrow import BorrowRequest, BorrowStatus
from backend.app.services.notification import send_status_update_notification

def check_and_send_reminders(db: Session):
    # Get all active approved or picked_up loans
    active_loans = db.query(BorrowRequest).filter(
        BorrowRequest.status.in_([BorrowStatus.APPROVED, BorrowStatus.PICKED_UP])
    ).all()
    
    now = datetime.utcnow()
    # Normalize 'today' for simple date comparison if time of day shouldn't matter, 
    # but since we are running a job, we can just do day-level comparisons
    today = now.date()
    
    for loan in active_loans:
        # Check pickup deadline for APPROVED (not yet PICKED_UP)
        if loan.status == BorrowStatus.APPROVED and loan.pickup_deadline:
            if now > loan.pickup_deadline:
                loan.status = BorrowStatus.CANCELLED
                send_status_update_notification(
                    loan.user_id, 
                    "CANCELLED", 
                    "Your loan was cancelled because you did not pick it up in time."
                )
                continue # Skip reminder checks if cancelled
                
        # Check due dates
        if not loan.due_date:
            continue
            
        due_date = loan.due_date.date()
        days_diff = (due_date - today).days
        
        if days_diff == 1:
            send_status_update_notification(loan.user_id, "REMINDER", "Your book is due tomorrow.")
        elif days_diff == 0:
            send_status_update_notification(loan.user_id, "DUE_TODAY", "Your book is due today.")
        elif days_diff == -3:
            send_status_update_notification(loan.user_id, "OVERDUE", "Your book is 3 days overdue!")
            
    db.commit()
