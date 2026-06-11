"""Dashboard, agenda and calendar-feed endpoints."""
from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_api_key
from app.schemas.dashboard import AgendaResponse, CalendarItem, DashboardStats
from app.services import dashboard_service

router = APIRouter(tags=["dashboard"], dependencies=[Depends(require_api_key)])


@router.get("/dashboard/stats", response_model=DashboardStats)
def stats(db: Session = Depends(get_db)):
    return dashboard_service.dashboard_stats(db)


@router.get("/agenda/today", response_model=AgendaResponse)
def agenda_today(
    db: Session = Depends(get_db),
    day: date | None = Query(default=None, description="Defaults to today (UTC)"),
):
    return dashboard_service.agenda(db, day)


@router.get("/calendar/items", response_model=list[CalendarItem])
def calendar_items(
    start: datetime = Query(..., description="Range start"),
    end: datetime = Query(..., description="Range end"),
    db: Session = Depends(get_db),
):
    return dashboard_service.calendar_items(db, start, end)
