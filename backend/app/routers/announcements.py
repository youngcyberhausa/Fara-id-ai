from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api", tags=["announcements"])


@router.get("/announcements/active", response_model=Optional[schemas.AnnouncementOut])
def get_active_announcement(db: Session = Depends(get_db)):
    """Public — no login required — so guests see broadcasts too."""
    return (
        db.query(models.Announcement)
        .filter(models.Announcement.is_active.is_(True))
        .order_by(models.Announcement.created_at.desc())
        .first()
    )
