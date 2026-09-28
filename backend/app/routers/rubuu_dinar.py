import hmac
import os
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..firebase_service import firebase_is_configured, send_rubuu_dinar_alert
from .zakat import fetch_metal_prices

router = APIRouter(prefix="/api/rubuu-dinar", tags=["rubuu-dinar"])

# One shar'i dinar is commonly converted to 4.25g of gold for this app.
# One quarter is therefore 1.0625g.
RUBUU_DINAR_GRAMS = 1.0625
CURRENCY = "NGN"


def _cron_authorized(value: str | None) -> bool:
    secret = os.environ.get("CRON_SECRET", "")
    return bool(secret and value and hmac.compare_digest(value, secret))


def _format_price(price: float) -> str:
    return f"₦{price:,.2f}"


@router.get("/price", response_model=schemas.RubuuDinarPriceOut)
async def get_current_price(db: Session = Depends(get_db)):
    state = db.query(models.RubuuDinarPrice).filter(models.RubuuDinarPrice.id == "current").first()

    if state:
        return state

    prices = await fetch_metal_prices(CURRENCY)
    gold_price = prices["gold_price_per_gram"]
    if gold_price is None:
        raise HTTPException(status_code=503, detail="Live gold price is temporarily unavailable.")

    rubuu_price = round(gold_price * RUBUU_DINAR_GRAMS, 2)
    return {
        "currency": CURRENCY,
        "gold_price_per_gram": gold_price,
        "rubuu_dinar_price": rubuu_price,
        "previous_rubuu_dinar_price": None,
        "checked_at": None,
        "grams": RUBUU_DINAR_GRAMS,
    }


@router.post("/check")
async def check_rubuu_dinar_price(
    x_cron_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Called by Render Cron to check price and send FCM alerts.

    The app does not need to be open. The backend owns the price check and
    FCM delivery, so Android can receive the notification in the background.
    """
    if not _cron_authorized(x_cron_secret):
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    prices = await fetch_metal_prices(CURRENCY)
    gold_price = prices["gold_price_per_gram"]
    if gold_price is None:
        raise HTTPException(status_code=503, detail="Live gold price is temporarily unavailable.")

    new_price = round(gold_price * RUBUU_DINAR_GRAMS, 2)
    state = db.query(models.RubuuDinarPrice).filter(models.RubuuDinarPrice.id == "current").first()

    if state is None:
        state = models.RubuuDinarPrice(
            id="current",
            currency=CURRENCY,
            gold_price_per_gram=gold_price,
            rubuu_dinar_price=new_price,
            previous_rubuu_dinar_price=None,
            checked_at=datetime.utcnow(),
            last_notified_price=new_price,
        )
        db.add(state)
        db.commit()
        return {
            "status": "initialized",
            "currency": CURRENCY,
            "gold_price_per_gram": gold_price,
            "rubuu_dinar_price": new_price,
            "notified_users": 0,
        }

    old_price = float(state.rubuu_dinar_price)
    state.gold_price_per_gram = gold_price
    state.checked_at = datetime.utcnow()

    if new_price == old_price:
        db.commit()
        return {
            "status": "unchanged",
            "currency": CURRENCY,
            "gold_price_per_gram": gold_price,
            "rubuu_dinar_price": new_price,
            "notified_users": 0,
        }

    rows = (
        db.query(models.DeviceToken, models.User.id)
        .join(models.User, models.DeviceToken.user_id == models.User.id)
        .filter(
            models.User.push_notifications_enabled.is_(True),
            models.DeviceToken.is_active.is_(True),
        )
        .all()
    )

    token_to_user = {row[0].token: row[1] for row in rows}
    tokens = list(token_to_user.keys())

    # If users have opted in but Firebase is not configured, do not advance
    # the notification baseline. A later cron run can retry after Firebase is
    # configured instead of silently losing the alert.
    if tokens and not firebase_is_configured():
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="Firebase push notifications are not configured on the server.",
        )

    successful_tokens: set[str] = set()
    invalid_tokens: set[str] = set()

    if tokens:
        successful_tokens, invalid_tokens = send_rubuu_dinar_alert(
            tokens,
            price=new_price,
            previous_price=old_price,
            currency=CURRENCY,
        )

        if invalid_tokens:
            (
                db.query(models.DeviceToken)
                .filter(models.DeviceToken.token.in_(invalid_tokens))
                .update({"is_active": False}, synchronize_session=False)
            )

    successful_user_ids = {
        token_to_user[token] for token in successful_tokens if token in token_to_user
    }

    direction = "up" if new_price > old_price else "down"
    for user_id in successful_user_ids:
        db.add(
            models.RubuuDinarAlert(
                user_id=user_id,
                price=new_price,
                previous_price=old_price,
                direction=direction,
            )
        )

    # Even when there are no registered devices, persist the new price. A
    # newly registered device will receive future changes, not old history.
    state.previous_rubuu_dinar_price = old_price
    state.rubuu_dinar_price = new_price
    state.last_notified_price = new_price if not tokens or successful_tokens else old_price
    db.commit()

    return {
        "status": "changed",
        "currency": CURRENCY,
        "gold_price_per_gram": gold_price,
        "previous_rubuu_dinar_price": old_price,
        "rubuu_dinar_price": new_price,
        "notified_users": len(successful_user_ids),
        "invalid_tokens": len(invalid_tokens),
        "price_text": _format_price(new_price),
    }
