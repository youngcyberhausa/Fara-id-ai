import os
import hmac
import hashlib
import json
from datetime import datetime, timedelta

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

PAYSTACK_SECRET_KEY = os.environ.get("PAYSTACK_SECRET_KEY")
PREMIUM_MONTHLY_PRICE_KOBO = int(os.environ.get("PREMIUM_MONTHLY_PRICE_KOBO", "30000"))  # ₦300 default
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
PAYSTACK_BASE = "https://api.paystack.co"


class InitPaymentResponse(BaseModel):
    authorization_url: str
    reference: str


@router.post("/initialize", response_model=InitPaymentResponse)
async def initialize_payment(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments aren't configured yet.")

    reference = f"faraid_{user.id[:8]}_{int(datetime.utcnow().timestamp())}"

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
            json={
                "email": user.email,
                "amount": PREMIUM_MONTHLY_PRICE_KOBO,
                "reference": reference,
                "currency": "NGN",
                "channels": ["card", "bank", "ussd", "mobile_money", "bank_transfer", "qr"],
                "callback_url": f"{FRONTEND_URL}?payment=callback",
                "metadata": {"user_id": user.id, "purpose": "premium_monthly"},
            },
        )
    data = resp.json()
    if not data.get("status"):
        raise HTTPException(status_code=502, detail=data.get("message", "Could not start payment."))

    payment = models.Payment(
        user_id=user.id,
        reference=reference,
        amount_kobo=PREMIUM_MONTHLY_PRICE_KOBO,
        status="pending",
    )
    db.add(payment)
    db.commit()

    return InitPaymentResponse(
        authorization_url=data["data"]["authorization_url"],
        reference=reference,
    )


async def _verify_and_grant(reference: str, db: Session) -> bool:
    """Verifies a transaction with Paystack and grants premium if successful.
    Returns True if premium was granted (or already active from this ref)."""
    payment = db.query(models.Payment).filter(models.Payment.reference == reference).first()
    if not payment:
        return False
    if payment.status == "success":
        return True

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{PAYSTACK_BASE}/transaction/verify/{reference}",
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
        )
    data = resp.json()
    if not data.get("status") or data.get("data", {}).get("status") != "success":
        payment.status = "failed"
        db.commit()
        return False

    payment.status = "success"
    payment.verified_at = datetime.utcnow()

    user = db.query(models.User).filter(models.User.id == payment.user_id).first()
    if user:
        base = user.premium_expires_at if (user.premium_expires_at and user.premium_expires_at > datetime.utcnow()) else datetime.utcnow()
        user.premium_expires_at = base + timedelta(days=30)
        user.is_premium = True
        customer_code = data.get("data", {}).get("customer", {}).get("customer_code")
        if customer_code:
            user.paystack_customer_code = customer_code

    db.commit()
    return True


@router.get("/verify/{reference}")
async def verify_payment(
    reference: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    granted = await _verify_and_grant(reference, db)
    db.refresh(user)
    return {"granted": granted, "is_premium": user.is_premium, "premium_expires_at": user.premium_expires_at}


@router.post("/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Paystack calls this server-to-server after a payment event. Verifies the
    signature so we don't trust unauthenticated requests."""
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments aren't configured.")

    body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = json.loads(body)
    if event.get("event") == "charge.success":
        reference = event["data"]["reference"]
        await _verify_and_grant(reference, db)

    return {"received": True}
