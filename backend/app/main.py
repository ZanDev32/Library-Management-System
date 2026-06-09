from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # On startup: create tables if they don't exist (dev convenience)
    from app.core.database import engine, Base, AsyncSessionLocal
    import app.models  # noqa: F401 — ensures models are imported
    from app.core.seed import seed_librarian

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default librarian
    async with AsyncSessionLocal() as session:
        await seed_librarian(session)

    yield
    # On shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Library Management System",
        description="API for Universitas XYZ Library",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    # Routers
    from app.routers import auth, book

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(book.router)

    return app


app = create_app()
