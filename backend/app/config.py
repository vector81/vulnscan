from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://vulnscan:vulnscan_secret@db:5432/vulnscan"
    REDIS_URL: str = "redis://redis:6379/0"
    SCAN_DIR: str = "/tmp/vulnscan"

    class Config:
        env_file = ".env"


settings = Settings()
