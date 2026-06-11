"""Domain enumerations shared by models and Pydantic schemas.

Values are stored as plain strings in the database (see models) which keeps
Alembic migrations simple, while these enums give us validation and a single
source of truth at the API layer.
"""
import enum


class ContactSource(str, enum.Enum):
    linkedin = "linkedin"
    email = "email"
    whatsapp = "whatsapp"
    referral = "referral"
    event = "event"
    cold = "cold"
    other = "other"


class ContactStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    awaiting_reply = "awaiting_reply"
    in_conversation = "in_conversation"
    meeting_scheduled = "meeting_scheduled"
    qualified = "qualified"
    won = "won"
    lost = "lost"
    on_hold = "on_hold"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class InteractionChannel(str, enum.Enum):
    linkedin = "linkedin"
    email = "email"
    whatsapp = "whatsapp"
    call = "call"
    meeting = "meeting"
    other = "other"


class InteractionDirection(str, enum.Enum):
    outbound = "outbound"
    inbound = "inbound"


class InteractionType(str, enum.Enum):
    connection_request = "connection_request"
    first_message = "first_message"
    follow_up = "follow_up"
    reply = "reply"
    call = "call"
    meeting = "meeting"
    note = "note"


class EventType(str, enum.Enum):
    meeting = "meeting"
    call = "call"
    reminder = "reminder"
    follow_up = "follow_up"
    task = "task"


class EventStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
