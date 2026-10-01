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

# One shar'i dinar = 4.25g of gold.
# One quarter = 1.0625g.
RUBUU_DINAR_GRAMS = 1.0625


def _cron_authorized(value: str | None) -> bool:
    secret = os.environ.get("CRON_SECRET", "")
    return bool(secret and value and hmac.compare_digest(value, secret))


def _normalize_currency(currency: str | None) -> str:
    value = (currency or "NGN").strip().upper()

    if len(value) != 3 or not value.isalpha():
        raise HTTPException(status_code=400, detail="Invalid currency code.")

    return value


def _state_id(currency: str) -> str:
    return f"current:{currency}"


def _format_price(price: float, currency: str) -> str:
    return f"{price:,.2f} {currency}"


@router.get("/price", response_model=schemas.RubuuDinarPriceOut)
async def get_current_price(currency: str = "NGN"):
    currency = _normalize_currency(currency)

    prices = await fetch_metal_prices(currency)
    gold_price = prices["gold_price_per_gram"]

    if gold_price is None:
        raise HTTPException(
            status_code=503,
            detail=f"Live gold price is temporarily unavailable for {currency}.",
        )

    rubuu_price = round(gold_price * RUBUU_DINAR_GRAMS, 2)

    return {
        "currency": currency,
        "gold_price_per_gram": gold_price,
        "rubuu_dinar_price": rubuu_price,
        "previous_rubuu_dinar_price": None,
        "checked_at": datetime.utcnow(),
        "grams": RUBUU_DINAR_GRAMS,
    }


@router.post("/check")
async def check_rubuu_dinar_price(
    x_cron_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Check Rubu'u Dinar prices for every currency used by alert users.

    The Android app does not need to be open. Render Cron calls this endpoint,
    the backend fetches each currency price, and Firebase sends the FCM alert.
    """

    if not _cron_authorized(x_cron_secret):
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    # Find currencies currently used by users who have enabled alerts and
    # have an active device token.
    rows = (
        db.query(
            models.User.id,
            models.User.rubuu_dinar_currency,
            models.DeviceToken.token,
        )
        .join(
            models.DeviceToken,
            models.DeviceToken.user_id == models.User.id,
        )
        .filter(
            models.User.push_notifications_enabled.is_(True),
            models.DeviceToken.is_active.is_(True),
        )
        .all()
    )

    currency_users: dict[str, set[str]] = {}
    currency_tokens: dict[str, dict[str, str]] = {}

    for user_id, raw_currency, token in rows:
        currency = _normalize_currency(raw_currency)

        currency_users.setdefault(currency, set()).add(user_id)
        currency_tokens.setdefault(currency, {})[token] = user_id

    # If nobody currently has an active push device, there is nothing to send.
    if not currency_users:
        return {
            "status": "no_active_alert_users",
            "currencies": [],
            "notified_users": 0,
        }

    if not firebase_is_configured():
        raise HTTPException(
            status_code=503,
            detail="Firebase push notifications are not configured on the server.",
        )

    results = []
    total_notified = 0
    total_invalid_tokens = 0

    for currency in sorted(currency_users.keys()):
        prices = await fetch_metal_prices(currency)
        gold_price = prices["gold_price_per_gram"]

        if gold_price is None:
            results.append({
                "currency": currency,
                "status": "price_unavailable",
                "notified_users": 0,
            })
            continue

        new_price = round(gold_price * RUBUU_DINAR_GRAMS, 2)
        state_id = _state_id(currency)

        state = (
            db.query(models.RubuuDinarPrice)
            .filter(models.RubuuDinarPrice.id == state_id)
            .first()
        )

        # Compatibility with the old single NGN state.
        if state is None and currency == "NGN":
            legacy_state = (
                db.query(models.RubuuDinarPrice)
                .filter(models.RubuuDinarPrice.id == "current")
                .first()
            )

            if legacy_state is not None:
                legacy_state.id = state_id
                legacy_state.currency = "NGN"
                state = legacy_state

        if state is None:
            state = models.RubuuDinarPrice(
                id=state_id,
                currency=currency,
                gold_price_per_gram=gold_price,
                rubuu_dinar_price=new_price,
                previous_rubuu_dinar_price=None,
                checked_at=datetime.utcnow(),
                last_notified_price=new_price,
            )
            db.add(state)
            db.commit()

            results.append({
                "currency": currency,
                "status": "initialized",
                "gold_price_per_gram": gold_price,
                "rubuu_dinar_price": new_price,
                "notified_users": 0,
            })
            continue

        old_price = float(state.rubuu_dinar_price)

        state.currency = currency
        state.gold_price_per_gram = gold_price
        state.checked_at = datetime.utcnow()

        if new_price == old_price:
            db.commit()

            results.append({
                "currency": currency,
                "status": "unchanged",
                "gold_price_per_gram": gold_price,
                "rubuu_dinar_price": new_price,
                "notified_users": 0,
            })
            continue

        token_to_user = currency_tokens.get(currency, {})
        tokens = list(token_to_user.keys())

        successful_tokens: set[str] = set()
        invalid_tokens: set[str] = set()

        if tokens:
            successful_tokens, invalid_tokens = send_rubuu_dinar_alert(
                tokens,
                price=new_price,
                previous_price=old_price,
                currency=currency,
            )

            if invalid_tokens:
                (
                    db.query(models.DeviceToken)
                    .filter(models.DeviceToken.token.in_(invalid_tokens))
                    .update(
                        {"is_active": False},
                        synchronize_session=False,
                    )
                )

        successful_user_ids = {
            token_to_user[token]
            for token in successful_tokens
            if token in token_to_user
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

        state.previous_rubuu_dinar_price = old_price
        state.rubuu_dinar_price = new_price
        state.last_notified_price = (
            new_price if not tokens or successful_tokens else old_price
        )

        db.commit()

        total_notified += len(successful_user_ids)
        total_invalid_tokens += len(invalid_tokens)

        results.append({
            "currency": currency,
            "status": "changed",
            "gold_price_per_gram": gold_price,
            "previous_rubuu_dinar_price": old_price,
            "rubuu_dinar_price": new_price,
            "notified_users": len(successful_user_ids),
            "invalid_tokens": len(invalid_tokens),
            "price_text": _format_price(new_price, currency),
        })

    return {
        "status": "completed",
        "currencies": results,
        "notified_users": total_notified,
        "invalid_tokens": total_invalid_tokens,
    }
