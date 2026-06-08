import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.app.api.endpoints.borrow import router as borrow_router
from backend.app.api.endpoints.librarian_borrow import router as librarian_router
from backend.app.models.borrow import Base, BorrowRequest, BorrowStatus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.api.deps import get_db, get_current_student, get_current_librarian

app = FastAPI()
app.include_router(borrow_router, prefix="/api/borrow")
app.include_router(librarian_router, prefix="/api/librarian/requests")

# Setup Test DB
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
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

def test_request_borrow():
    response = client.post("/api/borrow/request", json={"book_id": 10})
    assert response.status_code == 200
    assert response.json()["message"] == "Borrow request submitted"

def test_librarian_approve_reject():
    # First create a request
    client.post("/api/borrow/request", json={"book_id": 10})
    
    # Process it
    response = client.post("/api/librarian/requests/process", json={
        "actions": [
            {"request_id": 1, "action": "APPROVE"}
        ]
    })
    assert response.status_code == 200
    assert response.json()["results"][0]["status"] == "success"
    assert response.json()["results"][0]["action"] == "APPROVED"

    # Test rejection without reason
    client.post("/api/borrow/request", json={"book_id": 11})
    response = client.post("/api/librarian/requests/process", json={
        "actions": [
            {"request_id": 2, "action": "REJECT"}
        ]
    })
    assert response.json()["results"][0]["status"] == "error"
    assert "Reason is required" in response.json()["results"][0]["message"]
