"""Top-level interaction endpoints (update / delete by id)."""
import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_api_key
from app.schemas.interaction import InteractionRead, InteractionUpdate
from app.services import interaction_service

router = APIRouter(prefix="/interactions", tags=["interactions"], dependencies=[Depends(require_api_key)])


@router.get("/{interaction_id}", response_model=InteractionRead)
def get_interaction(interaction_id: uuid.UUID, db: Session = Depends(get_db)):
    return interaction_service.get_interaction_or_404(db, interaction_id)


@router.patch("/{interaction_id}", response_model=InteractionRead)
def update_interaction(interaction_id: uuid.UUID, payload: InteractionUpdate, db: Session = Depends(get_db)):
    return interaction_service.update_interaction(db, interaction_id, payload)


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(interaction_id: uuid.UUID, db: Session = Depends(get_db)):
    interaction_service.delete_interaction(db, interaction_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
