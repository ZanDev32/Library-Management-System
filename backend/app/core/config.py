from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://lms_user:changeme@db:5432/lms_db"

    # JWT
    SECRET_KEY: str = "changeme_generate_a_random_secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie security (set True in production over HTTPS)
    COOKIE_SECURE: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Seed admin
    ADMIN_EMAIL: str = "admin@university.ac.id"
    ADMIN_PASSWORD: str = "changeme_admin_password"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
