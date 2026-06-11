"""Shared FastAPI dependencies (API-key protection)."""
from fastapi import Header, HTTPException, status

from app.config import settings


async def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    """Reject requests without a valid API key.

    If ``API_KEY`` is left empty in the environment, the check is skipped so the
    API can be used unprotected for quick local experiments.
    """
    if not settings.API_KEY:
        return
    if x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key (send it in the 'X-API-Key' header).",
        )
