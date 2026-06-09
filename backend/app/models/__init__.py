# Models package — import all models so Base.metadata collects them
from app.models.user import User  # noqa: F401
from app.models.book import Book  # noqa: F401
from app.models.borrow import BorrowRecord  # noqa: F401
