import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.models.borrow import Base, BorrowRequest, BorrowStatus
from backend.app.jobs.overdue import check_and_send_reminders

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_check_and_send_reminders():
    db = TestingSessionLocal()
    now = datetime.utcnow()
    
    # Due tomorrow
    req1 = BorrowRequest(user_id=1, book_id=10, status=BorrowStatus.PICKED_UP, due_date=now + timedelta(days=1))
    # Due today
    req2 = BorrowRequest(user_id=2, book_id=10, status=BorrowStatus.PICKED_UP, due_date=now)
    # Overdue 3 days
    req3 = BorrowRequest(user_id=3, book_id=10, status=BorrowStatus.PICKED_UP, due_date=now - timedelta(days=3))
    # Pickup deadline passed
    req4 = BorrowRequest(user_id=4, book_id=10, status=BorrowStatus.APPROVED, pickup_deadline=now - timedelta(days=1))
    
    db.add_all([req1, req2, req3, req4])
    db.commit()
    
    # We just run it to make sure no exceptions, since send_notification is a stub
    # In a real test, we would mock send_status_update_notification and assert calls
    check_and_send_reminders(db)
    
    # Check that req4 is cancelled
    db.refresh(req4)
    assert req4.status == BorrowStatus.CANCELLED
    
    db.close()
