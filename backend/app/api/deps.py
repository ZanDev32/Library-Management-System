# Stub for dependencies
from typing import Generator
from sqlalchemy.orm import Session

def get_db() -> Generator:
    yield Session()

def get_current_student():
    return {"id": 1, "role": "student"}

def get_current_librarian():
    return {"id": 2, "role": "librarian"}
