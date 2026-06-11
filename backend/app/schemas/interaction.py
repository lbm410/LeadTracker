"""Pydantic schemas for interactions."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.enums import InteractionChannel, InteractionDirection, InteractionType
from app.schemas.common import empty_str_to_none


class InteractionBase(BaseModel):
    channel: InteractionChannel
    direction: InteractionDirection = InteractionDirection.outbound
    interaction_type: InteractionType
    content: str | None = None
    outcome: str | None = None
    occurred_at: datetime

    @field_validator("content", "outcome", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    channel: InteractionChannel | None = None
    direction: InteractionDirection | None = None
    interaction_type: InteractionType | None = None
    content: str | None = None
    outcome: str | None = None
    occurred_at: datetime | None = None

    @field_validator("content", "outcome", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        return empty_str_to_none(value)


class InteractionRead(InteractionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contact_id: UUID
    created_at: datetime
    updated_at: datetime
