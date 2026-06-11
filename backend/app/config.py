"""Application settings, loaded from environment variables."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://leadtracker:leadtracker@db:5432/leadtracker"

    # Simple single-user API protection. If empty, the API is left unprotected
    # (handy for quick local experiments, not recommended otherwise).
    API_KEY: str = "dev-local-key-change-me"

    # CORS origins allowed to call the API (the Vite dev server by default).
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # A lead is considered "cold" after this many days without any interaction.
    COLD_LEAD_DAYS: int = 7

    APP_NAME: str = "LeadTracker Pro"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
