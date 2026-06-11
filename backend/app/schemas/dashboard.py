"""Schemas for dashboard, agenda and calendar feed responses."""
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel

from app.enums import EventType
from app.schemas.contact import ContactRead
from app.schemas.event import EventRead


class StageConversion(BaseModel):
    status: str
    count: int


class DashboardStats(BaseModel):
    total_contacts: int
    leads_by_status: dict[str, int]
    leads_by_priority: dict[str, int]
    interactions_this_week: int
    upcoming_events: list[EventRead]
    cold_leads_count: int
    actions_due_today: int
    won_count: int
    lost_count: int
    conversion_rate: float  # won / (won + lost), 0..1
    pipeline: list[StageConversion]


class AgendaResponse(BaseModel):
    day: date
    today_events: list[EventRead]
    overdue_actions: list[ContactRead]
    today_actions: list[ContactRead]
    cold_leads: list[ContactRead]


class CalendarItem(BaseModel):
    """Unified calendar feed entry — a real event or an implicit next-action."""

    id: str
    kind: str  # "event" | "next_action"
    title: str
    start: datetime
    end: datetime | None = None
    all_day: bool
    event_type: EventType
    status: str
    contact_id: UUID | None = None
    contact_name: str | None = None
    location: str | None = None
