"""Interaction ORM model (a logged touch with a lead)."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Interaction(TimestampMixin, Base):
    __tablename__ = "interactions"

    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    channel: Mapped[str] = mapped_column(String(32), nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(32), nullable=False)

    content: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(String(512))

    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    contact: Mapped["Contact"] = relationship(back_populates="interactions")


from app.models.contact import Contact  # noqa: E402
