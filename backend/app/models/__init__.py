"""Import all models so SQLAlchemy and Alembic see the full metadata."""
from app.models.base import Base
from app.models.contact import Contact
from app.models.event import Event
from app.models.interaction import Interaction

__all__ = ["Base", "Contact", "Event", "Interaction"]
