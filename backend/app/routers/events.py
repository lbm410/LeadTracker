"""Calendar event endpoints."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_api_key
from app.enums import EventStatus, EventType
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.services import event_service

router = APIRouter(prefix="/events", tags=["events"], dependencies=[Depends(require_api_key)])


@router.get("", response_model=list[EventRead])
def list_events(
    db: Session = Depends(get_db),
    start: datetime | None = Query(default=None, description="Range start (inclusive)"),
    end: datetime | None = Query(default=None, description="Range end (inclusive)"),
    contact_id: uuid.UUID | None = Query(default=None),
    event_type: EventType | None = Query(default=None),
    status: EventStatus | None = Query(default=None),
):
    return event_service.list_events(
        db,
        start=start,
        end=end,
        contact_id=contact_id,
        event_type=event_type.value if event_type else None,
        status_=status.value if status else None,
    )


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    return event_service.create_event(db, payload)


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: uuid.UUID, db: Session = Depends(get_db)):
    return event_service.get_event_or_404(db, event_id)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: uuid.UUID, payload: EventUpdate, db: Session = Depends(get_db)):
    return event_service.update_event(db, event_id, payload)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: uuid.UUID, db: Session = Depends(get_db)):
    event_service.delete_event(db, event_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
