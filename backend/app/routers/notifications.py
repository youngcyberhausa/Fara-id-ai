from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _normalize_currency(currency: str | None) -> str:
    value = (currency or "NGN").strip().upper()

    if len(value) != 3 or not value.isalpha():
        raise HTTPException(status_code=400, detail="Invalid currency code.")

    return value


@router.get("/preferences", response_model=schemas.NotificationPreferenceOut)
def get_preferences(user: models.User = Depends(get_current_user)):
    return {
        "enabled": bool(user.push_notifications_enabled),
        "currency": user.rubuu_dinar_currency or "NGN",
    }


@router.patch("/preferences", response_model=schemas.NotificationPreferenceOut)
def update_preferences(
    req: schemas.NotificationPreferenceRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    user.push_notifications_enabled = req.enabled

    # Save the Rubu'u Dinar currency whenever the client supplies one.
    # This is stored server-side because automatic alerts can happen while
    # the Android app is completely closed.
    if req.currency is not None:
        user.rubuu_dinar_currency = _normalize_currency(req.currency)

    # When the user explicitly turns alerts off, deactivate existing device
    # tokens so the backend cannot accidentally notify this device.
    if not req.enabled:
        (
            db.query(models.DeviceToken)
            .filter(models.DeviceToken.user_id == user.id)
            .update({"is_active": False}, synchronize_session=False)
        )

    db.commit()

    return {
        "enabled": bool(user.push_notifications_enabled),
        "currency": user.rubuu_dinar_currency or "NGN",
    }


@router.post("/device-token")
def register_device_token(
    req: schemas.DeviceTokenRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    token = req.token.strip()

    existing = (
        db.query(models.DeviceToken)
        .filter(models.DeviceToken.token == token)
        .first()
    )

    if existing:
        existing.user_id = user.id
        existing.platform = req.platform.lower()
        existing.is_active = True
    else:
        existing = models.DeviceToken(
            user_id=user.id,
            token=token,
            platform=req.platform.lower(),
            is_active=True,
        )
        db.add(existing)

    db.commit()
    return {"registered": True}


@router.delete("/device-token")
def remove_device_token(
    req: schemas.DeviceTokenRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    (
        db.query(models.DeviceToken)
        .filter(
            models.DeviceToken.user_id == user.id,
            models.DeviceToken.token == req.token.strip(),
        )
        .delete(synchronize_session=False)
    )

    db.commit()
    return {"removed": True}
