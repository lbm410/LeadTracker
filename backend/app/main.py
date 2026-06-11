"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import contacts, dashboard, events, interactions

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Personal single-user CRM for sales prospecting: leads, interactions and a calendar.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts.router)
app.include_router(interactions.router)
app.include_router(events.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "name": f"{settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health",
    }
