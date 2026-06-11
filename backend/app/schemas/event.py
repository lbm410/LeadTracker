"""Pydantic schemas for calendar events."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.enums import EventStatus, EventType
from app.schemas.common import empty_str_to_none
from app.schemas.contact import ContactSummary


class EventBase(BaseModel):
    contact_id: UUID | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    event_type: EventType = EventType.meeting
    start_at: datetime
    end_at: datetime | None = None
    all_day: bool = False
    location: str | None = None
    status: EventStatus = EventStatus.scheduled
    reminder_minutes_before: int | None = Field(default=None, ge=0)

    @field_validator("description", "location", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)

    @model_validator(mode="after")
    def _check_dates(self) -> "EventBase":
        if self.end_at is not None and self.end_at < self.start_at:
            raise ValueError("end_at must be on or after start_at")
        return self


class EventCreate(EventBase):
    # When true and the event is a meeting/call linked to a contact, the contact
    # status is bumped to ``meeting_scheduled``. Offered, never forced.
    update_contact_status: bool = False


class EventUpdate(BaseModel):
    contact_id: UUID | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    event_type: EventType | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    all_day: bool | None = None
    location: str | None = None
    status: EventStatus | None = None
    reminder_minutes_before: int | None = Field(default=None, ge=0)

    @field_validator("description", "location", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    contact: ContactSummary | None = None
