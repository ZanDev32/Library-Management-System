import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models.borrow import Base, BorrowRequest, BorrowStatus, Waitlist, WaitlistStatus, ExtensionRequest, ExtensionStatus

@pytest.fixture(scope="module")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)

def test_create_borrow_request(db_session):
    request = BorrowRequest(user_id=1, book_id=10)
    db_session.add(request)
    db_session.commit()
    
    assert request.id is not None
    assert request.status == BorrowStatus.PENDING

def test_create_waitlist(db_session):
    waitlist = Waitlist(user_id=2, book_id=10)
    db_session.add(waitlist)
    db_session.commit()
    
    assert waitlist.id is not None
    assert waitlist.status == WaitlistStatus.WAITING

def test_create_extension_request(db_session):
    ext_req = ExtensionRequest(borrow_request_id=1)
    db_session.add(ext_req)
    db_session.commit()
    
    assert ext_req.id is not None
    assert ext_req.status == ExtensionStatus.PENDING
