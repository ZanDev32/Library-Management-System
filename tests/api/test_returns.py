import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.app.api.endpoints.librarian_borrow import router as librarian_router
from backend.app.models.borrow import Base, BorrowRequest, BorrowStatus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.api.deps import get_db, get_current_librarian

app = FastAPI()
app.include_router(librarian_router, prefix="/api/librarian/requests")

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_return_scan():
    # Setup db with a picked up loan
    db = TestingSessionLocal()
    req = BorrowRequest(user_id=1, book_id=10, status=BorrowStatus.PICKED_UP)
    db.add(req)
    db.commit()
    db.close()

    response = client.post("/api/librarian/requests/returns/scan", json={"loan_id": 1})
    assert response.status_code == 200
    assert response.json()["message"] == "Book returned successfully"
    assert response.json()["days_late"] == 0

def test_mark_picked_up():
    db = TestingSessionLocal()
    req = BorrowRequest(user_id=1, book_id=10, status=BorrowStatus.APPROVED)
    db.add(req)
    db.commit()
    db.close()

    response = client.post("/api/librarian/requests/1/pickup")
    assert response.status_code == 200
    assert response.json()["message"] == "Book marked as picked up"
