"""Seed a default librarian account if none exists."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User


async def seed_librarian(db: AsyncSession) -> None:
    result = await db.execute(
        select(User).where(User.role == "librarian").limit(1)
    )
    if result.scalar_one_or_none() is not None:
        return  # Librarian already exists

    admin = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        full_name="System Admin",
        role="librarian",
    )
    db.add(admin)
    await db.commit()
    print(f"[seed] Librarian created: {settings.ADMIN_EMAIL}")
