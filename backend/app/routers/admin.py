from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..deps import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.AdminStats)
def get_stats(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_cases = db.query(func.count(models.Case.id)).scalar() or 0
    premium_users = (
        db.query(func.count(models.User.id)).filter(models.User.is_premium.is_(True)).scalar() or 0
    )
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_7d = (
        db.query(func.count(models.User.id)).filter(models.User.created_at >= week_ago).scalar() or 0
    )
    return {
        "total_users": total_users,
        "total_cases": total_cases,
        "premium_users": premium_users,
        "new_users_7d": new_users_7d,
    }


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
    limit: int = 200,
):
    return (
        db.query(models.User)
        .order_by(models.User.created_at.desc())
        .limit(min(limit, 500))
        .all()
    )


@router.get("/announcements", response_model=List[schemas.AnnouncementOut])
def list_announcements(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    return (
        db.query(models.Announcement)
        .order_by(models.Announcement.created_at.desc())
        .all()
    )


@router.post("/announcements", response_model=schemas.AnnouncementOut)
def create_announcement(
    payload: schemas.AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    db.query(models.Announcement).filter(models.Announcement.is_active.is_(True)).update(
        {"is_active": False}
    )
    ann = models.Announcement(
        title=payload.title,
        message=payload.message,
        video_url=payload.video_url,
        is_active=True,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/announcements/{ann_id}")
def deactivate_announcement(
    ann_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user),
):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ann.is_active = False
    db.commit()
    return {"deactivated": True}
