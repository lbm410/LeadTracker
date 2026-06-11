"""Contact + nested interaction endpoints."""
import uuid

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_api_key
from app.enums import ContactSource, ContactStatus, Priority
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from app.schemas.event import EventRead
from app.schemas.interaction import InteractionCreate, InteractionRead
from app.services import contact_service, event_service, interaction_service

router = APIRouter(prefix="/contacts", tags=["contacts"], dependencies=[Depends(require_api_key)])


@router.get("", response_model=list[ContactRead])
def list_contacts(
    db: Session = Depends(get_db),
    status: ContactStatus | None = Query(default=None),
    source: ContactSource | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    tag: str | None = Query(default=None),
    q: str | None = Query(default=None, description="Free-text search on name/company/email/role"),
    sort: str = Query(default="-updated_at"),
):
    return contact_service.list_contacts(
        db,
        status_=status.value if status else None,
        source=source.value if source else None,
        priority=priority.value if priority else None,
        tag=tag,
        q=q,
        sort=sort,
    )


@router.get("/cold", response_model=list[ContactRead])
def cold_leads(
    db: Session = Depends(get_db),
    days: int | None = Query(default=None, ge=1, description="Days without interaction"),
):
    return contact_service.cold_leads(db, days=days)


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    return contact_service.create_contact(db, payload)


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: uuid.UUID, db: Session = Depends(get_db)):
    return contact_service.get_contact_or_404(db, contact_id)


@router.patch("/{contact_id}", response_model=ContactRead)
def update_contact(contact_id: uuid.UUID, payload: ContactUpdate, db: Session = Depends(get_db)):
    return contact_service.update_contact(db, contact_id, payload)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: uuid.UUID, db: Session = Depends(get_db)):
    contact_service.delete_contact(db, contact_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- nested interactions -------------------------------------------------

@router.get("/{contact_id}/interactions", response_model=list[InteractionRead])
def list_interactions(contact_id: uuid.UUID, db: Session = Depends(get_db)):
    return interaction_service.list_for_contact(db, contact_id)


@router.post(
    "/{contact_id}/interactions",
    response_model=InteractionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_interaction(contact_id: uuid.UUID, payload: InteractionCreate, db: Session = Depends(get_db)):
    return interaction_service.create_interaction(db, contact_id, payload)


# --- nested events (read) ------------------------------------------------

@router.get("/{contact_id}/events", response_model=list[EventRead])
def list_contact_events(contact_id: uuid.UUID, db: Session = Depends(get_db)):
    return event_service.list_for_contact(db, contact_id)
