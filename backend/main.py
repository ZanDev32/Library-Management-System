from datetime import datetime, timedelta
from typing import Optional

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Field, Session, SQLModel, create_engine, select

DATABASE_URL = "postgresql://postgres:postgres@db:5432/library"
JWT_SECRET = "supersecretkey_change_me"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

engine = create_engine(DATABASE_URL, echo=False)
app = FastAPI(title="Library Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    password_hash: str
    role: str = Field(default="student", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str
    isbn: Optional[str] = None
    published_year: Optional[int] = None
    available: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LoanRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, nullable=False)
    book_id: int = Field(index=True, nullable=False)
    borrowed_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: datetime
    returned_at: Optional[datetime] = None

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(SQLModel):
    email: str
    password: str
    role: Optional[str] = "student"

class UserRead(SQLModel):
    id: int
    email: str
    role: str
    created_at: datetime

class BookCreate(SQLModel):
    title: str
    author: str
    isbn: Optional[str] = None
    published_year: Optional[int] = None

class BookRead(SQLModel):
    id: int
    title: str
    author: str
    isbn: Optional[str]
    published_year: Optional[int]
    available: bool
    created_at: datetime

class BookUpdate(SQLModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    published_year: Optional[int] = None
    available: Optional[bool] = None


class LoanCreate(SQLModel):
    user_id: int
    book_id: int
    due_date: datetime


class LoanRead(SQLModel):
    id: int
    user_id: int
    book_id: int
    borrowed_at: datetime
    due_date: datetime
    returned_at: Optional[datetime]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_session():
    with Session(engine) as session:
        yield session


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(session, email)
    if user is None:
        raise credentials_exception
    return user


def require_role(role: str):
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return current_user
    return role_dependency


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if not session.exec(select(User).where(User.email == "librarian@example.com")).first():
            user = User(
                email="librarian@example.com",
                password_hash=get_password_hash("librarianpassword"),
                role="librarian",
            )
            session.add(user)
            session.commit()
        # seed a default student for quick verification
        if not session.exec(select(User).where(User.email == "student@example.com")).first():
            student = User(
                email="student@example.com",
                password_hash=get_password_hash("studentpassword"),
                role="student",
            )
            session.add(student)
            session.commit()

        # seed default books for demo/testing
        if not session.exec(select(Book)).first():
            books = [
                Book(title="Clean Code", author="Robert C. Martin", isbn="9780132350884", published_year=2008),
                Book(title="The Pragmatic Programmer", author="Andrew Hunt & David Thomas", isbn="9780201616224", published_year=1999),
                Book(title="Eloquent JavaScript", author="Marijn Haverbeke", isbn="9781593279509", published_year=2018),
            ]
            session.add_all(books)
            session.commit()


@app.post("/auth/register", response_model=UserRead)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    if get_user_by_email(session, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if user_in.role != "student":
        raise HTTPException(status_code=400, detail="Only student registration is allowed")
    try:
        password_hash = get_password_hash(user_in.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    user = User(
        email=user_in.email,
        password_hash=password_hash,
        role="student",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.post("/auth/login", response_model=Token)
async def login(request: Request, session: Session = Depends(get_session)):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
    else:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail="Username and password are required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = authenticate_user(session, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(access_token=access_token)


@app.get("/auth/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/books", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate, session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    book = Book(**book_in.dict())
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


@app.post("/loans", response_model=LoanRead, status_code=status.HTTP_201_CREATED)
def create_loan(loan_in: LoanCreate, session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    book = session.get(Book, loan_in.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if not book.available:
        raise HTTPException(status_code=400, detail="Book is not available")
    loan = LoanRecord(user_id=loan_in.user_id, book_id=loan_in.book_id, due_date=loan_in.due_date)
    book.available = False
    session.add(loan)
    session.add(book)
    session.commit()
    session.refresh(loan)
    return loan


@app.get("/loans", response_model=list[LoanRead])
def list_loans(session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    loans = session.exec(select(LoanRecord).order_by(LoanRecord.borrowed_at)).all()
    return loans


@app.get("/admin/metrics")
def admin_metrics(session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    books = session.exec(select(Book)).all()
    total_books = len(books)
    users = session.exec(select(User)).all()
    total_users = len(users)
    active_loans = session.exec(select(LoanRecord).where(LoanRecord.returned_at == None)).all()
    active_loans_count = len(active_loans)
    from datetime import timezone
    now = datetime.utcnow()
    overdue_loans = [l for l in active_loans if l.due_date < now]
    overdue_count = len(overdue_loans)
    return {
        "total_books": total_books,
        "total_users": total_users,
        "active_loans": active_loans_count,
        "overdue_loans": overdue_count,
    }


@app.get("/books", response_model=list[BookRead])
def list_books(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    books = session.exec(select(Book).order_by(Book.created_at)).all()
    return books


@app.get("/books/{book_id}", response_model=BookRead)
def read_book(book_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@app.put("/books/{book_id}", response_model=BookRead)
def update_book(book_id: int, book_in: BookUpdate, session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    book_data = book_in.dict(exclude_unset=True)
    for key, value in book_data.items():
        setattr(book, key, value)
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, session: Session = Depends(get_session), current_user: User = Depends(require_role("librarian"))):
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    session.delete(book)
    session.commit()
    return
