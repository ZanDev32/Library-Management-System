from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate


async def register_user(db: AsyncSession, user_create: UserCreate) -> User:
    # Check email uniqueness
    result = await db.execute(
        select(User).where(User.email == user_create.email)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Always create as student — librarian role cannot be self-assigned
    user = User(
        email=user_create.email,
        hashed_password=hash_password(user_create.password),
        full_name=user_create.full_name,
        role="student",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    payload = {"sub": str(user.id), "role": user.role}
    return create_access_token(payload), create_refresh_token(payload)


async def refresh_tokens(
    db: AsyncSession, refresh_token: str
) -> tuple[str, str]:
    payload = decode_token(refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return issue_tokens(user)
