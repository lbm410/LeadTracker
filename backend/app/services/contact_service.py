"""Business logic for contacts."""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


def get_contact_or_404(db: Session, contact_id: uuid.UUID) -> Contact:
    contact = db.get(Contact, contact_id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact


def list_contacts(
    db: Session,
    *,
    status_: str | None = None,
    source: str | None = None,
    priority: str | None = None,
    tag: str | None = None,
    q: str | None = None,
    sort: str = "-updated_at",
) -> list[Contact]:
    stmt = select(Contact)

    if status_:
        stmt = stmt.where(Contact.status == status_)
    if source:
        stmt = stmt.where(Contact.source == source)
    if priority:
        stmt = stmt.where(Contact.priority == priority)
    if tag:
        stmt = stmt.where(Contact.tags.any(tag))
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                Contact.full_name.ilike(like),
                Contact.company.ilike(like),
                Contact.email.ilike(like),
                Contact.role.ilike(like),
            )
        )

    sort_map = {
        "full_name": Contact.full_name.asc(),
        "-full_name": Contact.full_name.desc(),
        "created_at": Contact.created_at.asc(),
        "-created_at": Contact.created_at.desc(),
        "updated_at": Contact.updated_at.asc(),
        "-updated_at": Contact.updated_at.desc(),
        "last_contacted_at": Contact.last_contacted_at.asc().nullsfirst(),
        "-last_contacted_at": Contact.last_contacted_at.desc().nullslast(),
        "priority": Contact.priority.asc(),
    }
    stmt = stmt.order_by(sort_map.get(sort, Contact.updated_at.desc()))

    return list(db.execute(stmt).scalars().all())


def create_contact(db: Session, payload: ContactCreate) -> Contact:
    contact = Contact(**payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(db: Session, contact_id: uuid.UUID, payload: ContactUpdate) -> Contact:
    contact = get_contact_or_404(db, contact_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact_id: uuid.UUID) -> None:
    contact = get_contact_or_404(db, contact_id)
    db.delete(contact)
    db.commit()


def cold_leads(db: Session, days: int | None = None) -> list[Contact]:
    """Contacts with no interaction in more than ``days`` days.

    A contact counts as cold when ``last_contacted_at`` is older than the
    threshold OR was never set, as long as it is still an active lead (not
    won/lost). Created-but-never-touched leads count from their creation date.
    """
    threshold_days = days if days is not None else settings.COLD_LEAD_DAYS
    cutoff = datetime.now(timezone.utc) - timedelta(days=threshold_days)
    inactive_states = ("won", "lost")

    stmt = (
        select(Contact)
        .where(Contact.status.not_in(inactive_states))
        .where(
            or_(
                Contact.last_contacted_at < cutoff,
                Contact.last_contacted_at.is_(None) & (Contact.created_at < cutoff),
            )
        )
        .order_by(Contact.last_contacted_at.asc().nullsfirst())
    )
    return list(db.execute(stmt).scalars().all())
