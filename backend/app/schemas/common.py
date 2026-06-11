"""Reusable validators / helpers for schemas."""
from typing import Any


def empty_str_to_none(value: Any) -> Any:
    """Treat empty / whitespace-only strings as ``None``.

    Front-end forms often submit empty strings for optional fields; this keeps
    optional columns clean and avoids spurious validation errors (e.g. EmailStr).
    """
    if isinstance(value, str) and value.strip() == "":
        return None
    return value
