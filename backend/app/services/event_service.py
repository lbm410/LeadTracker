"""Business logic for calendar events."""
import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Contact, Event
from app.schemas.event import EventCreate, EventUpdate
from app.services.contact_service import get_contact_or_404

_STATUS_BUMP_TYPES = ("meeting", "call")


def get_event_or_404(db: Session, event_id: uuid.UUID) -> Event:
    stmt = select(Event).where(Event.id == event_id).options(selectinload(Event.contact))
    event = db.execute(stmt).scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def list_events(
    db: Session,
    *,
    start: datetime | None = None,
    end: datetime | None = None,
    contact_id: uuid.UUID | None = None,
    event_type: str | None = None,
    status_: str | None = None,
) -> list[Event]:
    stmt = select(Event).options(selectinload(Event.contact))
    if start is not None:
        stmt = stmt.where(Event.start_at >= start)
    if end is not None:
        stmt = stmt.where(Event.start_at <= end)
    if contact_id is not None:
        stmt = stmt.where(Event.contact_id == contact_id)
    if event_type:
        stmt = stmt.where(Event.event_type == event_type)
    if status_:
        stmt = stmt.where(Event.status == status_)
    stmt = stmt.order_by(Event.start_at.asc())
    return list(db.execute(stmt).scalars().all())


def list_for_contact(db: Session, contact_id: uuid.UUID, *, upcoming_only: bool = False) -> list[Event]:
    get_contact_or_404(db, contact_id)
    stmt = (
        select(Event)
        .where(Event.contact_id == contact_id)
        .options(selectinload(Event.contact))
        .order_by(Event.start_at.asc())
    )
    return list(db.execute(stmt).scalars().all())


def create_event(db: Session, payload: EventCreate) -> Event:
    data = payload.model_dump()
    update_contact_status = data.pop("update_contact_status", False)

    if data.get("contact_id") is not None:
        get_contact_or_404(db, data["contact_id"])

    event = Event(**data)
    db.add(event)

    # Business rule (offered, not forced): a meeting/call tied to a contact may
    # advance the contact to "meeting_scheduled".
    if (
        update_contact_status
        and event.contact_id is not None
        and event.event_type in _STATUS_BUMP_TYPES
    ):
        contact = db.get(Contact, event.contact_id)
        if contact is not None:
            contact.status = "meeting_scheduled"

    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event_id: uuid.UUID, payload: EventUpdate) -> Event:
    event = get_event_or_404(db, event_id)
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("contact_id") is not None:
        get_contact_or_404(db, updates["contact_id"])
    for field, value in updates.items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: uuid.UUID) -> None:
    event = get_event_or_404(db, event_id)
    db.delete(event)
    db.commit()
