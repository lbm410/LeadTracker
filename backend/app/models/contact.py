"""Contact (lead) ORM model."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Contact(TimestampMixin, Base):
    __tablename__ = "contacts"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(64))
    linkedin_url: Mapped[str | None] = mapped_column(String(512))

    source: Mapped[str] = mapped_column(String(32), nullable=False, default="other", server_default="other")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="new", server_default="new", index=True)
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="medium", server_default="medium")

    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list, server_default="{}")
    notes: Mapped[str | None] = mapped_column(Text)

    next_action: Mapped[str | None] = mapped_column(String(512))
    next_action_date: Mapped[date | None] = mapped_column(Date)

    # Updated automatically whenever an interaction is logged.
    last_contacted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    interactions: Mapped[list["Interaction"]] = relationship(
        back_populates="contact",
        cascade="all, delete-orphan",
        order_by="Interaction.occurred_at.desc()",
    )
    events: Mapped[list["Event"]] = relationship(
        back_populates="contact",
        cascade="all, delete-orphan",
        order_by="Event.start_at.asc()",
    )


from app.models.event import Event  # noqa: E402  (resolve relationship strings)
from app.models.interaction import Interaction  # noqa: E402
