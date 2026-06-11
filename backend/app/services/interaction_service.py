"""Business logic for interactions."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Contact, Interaction
from app.schemas.interaction import InteractionCreate, InteractionUpdate
from app.services.contact_service import get_contact_or_404


def get_interaction_or_404(db: Session, interaction_id: uuid.UUID) -> Interaction:
    interaction = db.get(Interaction, interaction_id)
    if interaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")
    return interaction


def list_for_contact(db: Session, contact_id: uuid.UUID) -> list[Interaction]:
    get_contact_or_404(db, contact_id)
    stmt = (
        select(Interaction)
        .where(Interaction.contact_id == contact_id)
        .order_by(Interaction.occurred_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def _refresh_last_contacted(contact: Contact, interaction: Interaction) -> None:
    """Keep ``last_contacted_at`` at the most recent interaction time."""
    if contact.last_contacted_at is None or interaction.occurred_at > contact.last_contacted_at:
        contact.last_contacted_at = interaction.occurred_at


def create_interaction(db: Session, contact_id: uuid.UUID, payload: InteractionCreate) -> Interaction:
    contact = get_contact_or_404(db, contact_id)
    interaction = Interaction(contact_id=contact_id, **payload.model_dump())
    db.add(interaction)
    # Business rule: logging an interaction updates the contact's last contact time.
    _refresh_last_contacted(contact, interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


def update_interaction(db: Session, interaction_id: uuid.UUID, payload: InteractionUpdate) -> Interaction:
    interaction = get_interaction_or_404(db, interaction_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(interaction, field, value)
    contact = db.get(Contact, interaction.contact_id)
    if contact is not None:
        _refresh_last_contacted(contact, interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


def delete_interaction(db: Session, interaction_id: uuid.UUID) -> None:
    interaction = get_interaction_or_404(db, interaction_id)
    db.delete(interaction)
    db.commit()
