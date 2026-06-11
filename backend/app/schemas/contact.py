"""Pydantic schemas for contacts."""
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.enums import ContactSource, ContactStatus, Priority
from app.schemas.common import empty_str_to_none


class ContactBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    company: str | None = None
    role: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    source: ContactSource = ContactSource.other
    status: ContactStatus = ContactStatus.new
    priority: Priority = Priority.medium
    tags: list[str] = Field(default_factory=list)
    notes: str | None = None
    next_action: str | None = None
    next_action_date: date | None = None

    @field_validator("email", "company", "role", "phone", "linkedin_url", "notes", "next_action", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    """All fields optional for PATCH semantics."""

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    company: str | None = None
    role: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    source: ContactSource | None = None
    status: ContactStatus | None = None
    priority: Priority | None = None
    tags: list[str] | None = None
    notes: str | None = None
    next_action: str | None = None
    next_action_date: date | None = None

    @field_validator("email", "company", "role", "phone", "linkedin_url", "notes", "next_action", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)


class ContactRead(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    last_contacted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ContactSummary(BaseModel):
    """Lightweight contact representation for embedding in other payloads."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    company: str | None = None
    status: ContactStatus
    priority: Priority
