from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # On startup: create tables if they don't exist (dev convenience)
    from app.core.database import engine, Base
    import app.models  # noqa: F401 — ensures models are imported

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

    return app


app = create_app()
