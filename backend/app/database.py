import asyncio
import os
import asyncpg
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+asyncpg://postgres:postgres@db:5432/library')

engine = create_async_engine(DATABASE_URL, future=True, echo=False)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def ensure_database_exists(retries: int = 10, delay: float = 1.0):
    url = make_url(DATABASE_URL)
    target_db = url.database or 'postgres'
    if target_db == 'postgres':
        return

    admin_url = url.set(database='postgres')
    conn = None
    for attempt in range(1, retries + 1):
        try:
            conn = await asyncpg.connect(
                user=admin_url.username,
                password=admin_url.password,
                database=admin_url.database,
                host=admin_url.host,
                port=admin_url.port or 5432,
            )
            break
        except Exception:
            if attempt == retries:
                raise
            await asyncio.sleep(delay)

    try:
        exists = await conn.fetchval('SELECT 1 FROM pg_database WHERE datname = $1', target_db)
        if not exists:
            await conn.execute(f'CREATE DATABASE "{target_db}"')
    finally:
        if conn is not None:
            await conn.close()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
