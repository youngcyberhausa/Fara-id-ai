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

# ============================================================
# CONFIG
# ============================================================

PAYSTACK_SECRET_KEY = os.environ.get("PAYSTACK_SECRET_KEY")

# Public price: $2.00/month
PREMIUM_MONTHLY_PRICE_USD_CENTS = int(
    os.environ.get("PREMIUM_MONTHLY_PRICE_USD_CENTS", "200")
)

# Convert cents -> dollars
PREMIUM_MONTHLY_PRICE_USD = PREMIUM_MONTHLY_PRICE_USD_CENTS / 100.0

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173",
)

PAYSTACK_BASE = "https://api.paystack.co"

# Free public exchange-rate API.
# You can override this in .env with USD_NGN_RATE_URL if needed.
USD_NGN_RATE_URL = os.environ.get(
    "USD_NGN_RATE_URL",
    "https://open.er-api.com/v6/latest/USD",
)


# ============================================================
# RESPONSE MODEL
# ============================================================

class InitPaymentResponse(BaseModel):
    authorization_url: str
    reference: str
    amount_ngn: int
    exchange_rate: float


# ============================================================
# USD -> NGN EXCHANGE RATE
# ============================================================

async def get_usd_ngn_rate() -> float:
    """
    Get the current USD -> NGN exchange rate.
    """

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(USD_NGN_RATE_URL)
            resp.raise_for_status()
            data = resp.json()

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Current USD/NGN exchange rate is unavailable.",
        )

    rate = data.get("rates", {}).get("NGN")

    if not rate:
        raise HTTPException(
            status_code=503,
            detail="NGN exchange rate was not returned.",
        )

    try:
        rate = float(rate)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=503,
            detail="Invalid USD/NGN exchange rate.",
        )

    if rate <= 0:
        raise HTTPException(
            status_code=503,
            detail="Invalid USD/NGN exchange rate.",
        )

    return rate


# ============================================================
# INITIALIZE PAYMENT
# ============================================================

@router.post("/initialize", response_model=InitPaymentResponse)
async def initialize_payment(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Initialize a $2 premium payment.

    User sees:
        $2/month

    Paystack receives:
        NGN amount

    Example:
        $2 × ₦1,500 = ₦3,000
        Paystack amount = 300,000 kobo
    """

    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Payments aren't configured yet.",
        )

    # --------------------------------------------------------
    # Get current USD -> NGN exchange rate
    # --------------------------------------------------------

    exchange_rate = await get_usd_ngn_rate()

    # --------------------------------------------------------
    # Convert $2 -> NGN
    # --------------------------------------------------------

    amount_ngn = round(
        PREMIUM_MONTHLY_PRICE_USD * exchange_rate
    )

    if amount_ngn <= 0:
        raise HTTPException(
            status_code=503,
            detail="Invalid NGN payment amount.",
        )

    # Paystack expects amount in kobo
    amount_kobo = amount_ngn * 100

    # --------------------------------------------------------
    # Unique payment reference
    # --------------------------------------------------------

    reference = (
        f"faraid_{user.id[:8]}_"
        f"{int(datetime.utcnow().timestamp())}"
    )

    # --------------------------------------------------------
    # Send NGN payment to Paystack
    # --------------------------------------------------------

    payload = {
        "email": user.email,

        # IMPORTANT:
        # Paystack amount must be in kobo.
        "amount": amount_kobo,

        # IMPORTANT:
        # Payment is now Naira, NOT USD.
        "currency": "NGN",

        "reference": reference,

        "channels": [
            "card",
            "bank",
            "ussd",
            "bank_transfer",
        ],

        "callback_url": (
            f"{FRONTEND_URL}"
            f"?payment=callback"
            f"&reference={reference}"
        ),

        "metadata": {
            "user_id": user.id,
            "purpose": "premium_monthly",

            # Public price
            "price_usd": PREMIUM_MONTHLY_PRICE_USD,

            # Exchange information
            "exchange_rate_usd_ngn": exchange_rate,

            # Actual amount user pays
            "amount_ngn": amount_ngn,
            "amount_kobo": amount_kobo,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{PAYSTACK_BASE}/transaction/initialize",
                headers={
                    "Authorization": (
                        f"Bearer {PAYSTACK_SECRET_KEY}"
                    ),
                    "Content-Type": "application/json",
                },
                json=payload,
            )

            data = resp.json()

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Paystack.",
        )

    # --------------------------------------------------------
    # Check Paystack response
    # --------------------------------------------------------

    if not resp.is_success or not data.get("status"):
        raise HTTPException(
            status_code=502,
            detail=data.get(
                "message",
                "Could not start payment.",
            ),
        )

    paystack_data = data.get("data", {})

    authorization_url = paystack_data.get(
        "authorization_url"
    )

    if not authorization_url:
        raise HTTPException(
            status_code=502,
            detail="Paystack did not return a checkout URL.",
        )

    # --------------------------------------------------------
    # Save payment locally
    # --------------------------------------------------------

    payment = models.Payment(
        user_id=user.id,
        reference=reference,

        # Store actual NGN amount in kobo.
        amount_kobo=amount_kobo,

        status="pending",
    )

    db.add(payment)
    db.commit()

    # --------------------------------------------------------
    # Return checkout information to frontend
    # --------------------------------------------------------

    return InitPaymentResponse(
        authorization_url=authorization_url,
        reference=reference,
        amount_ngn=amount_ngn,
        exchange_rate=exchange_rate,
    )


# ============================================================
# VERIFY PAYMENT + GRANT PREMIUM
# ============================================================

async def _verify_and_grant(
    reference: str,
    db: Session,
) -> bool:
    """
    Verify payment directly with Paystack.

    Before granting premium we verify:
    - transaction exists
    - status == success
    - currency == NGN
    - amount matches our stored amount
    """

    payment = (
        db.query(models.Payment)
        .filter(
            models.Payment.reference == reference
        )
        .first()
    )

    if not payment:
        return False

    # Already processed.
    # Prevent duplicate premium extension.
    if payment.status == "success":
        return True

    if not PAYSTACK_SECRET_KEY:
        return False

    # --------------------------------------------------------
    # Verify transaction with Paystack
    # --------------------------------------------------------

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{PAYSTACK_BASE}/transaction/verify/{reference}",
                headers={
                    "Authorization": (
                        f"Bearer {PAYSTACK_SECRET_KEY}"
                    )
                },
            )

            data = resp.json()

    except Exception:
        return False

    if not resp.is_success or not data.get("status"):
        payment.status = "failed"
        db.commit()
        return False

    transaction = data.get("data", {})

    # --------------------------------------------------------
    # Check transaction status
    # --------------------------------------------------------

    if transaction.get("status") != "success":
        payment.status = "failed"
        db.commit()
        return False

    # --------------------------------------------------------
    # SECURITY CHECK 1: currency
    # --------------------------------------------------------

    transaction_currency = (
        transaction.get("currency") or ""
    ).upper()

    if transaction_currency != "NGN":
        payment.status = "failed"
        db.commit()
        return False

    # --------------------------------------------------------
    # SECURITY CHECK 2: amount
    # --------------------------------------------------------

    try:
        transaction_amount = int(
            transaction.get("amount", 0)
        )
    except (TypeError, ValueError):
        payment.status = "failed"
        db.commit()
        return False

    if transaction_amount != int(payment.amount_kobo):
        payment.status = "failed"
        db.commit()
        return False

    # --------------------------------------------------------
    # Mark payment successful
    # --------------------------------------------------------

    payment.status = "success"
    payment.verified_at = datetime.utcnow()

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(models.User.id == payment.user_id)
        .first()
    )

    if not user:
        db.commit()
        return False

    # --------------------------------------------------------
    # Grant / extend premium for 30 days
    # --------------------------------------------------------

    now = datetime.utcnow()

    if (
        user.premium_expires_at
        and user.premium_expires_at > now
    ):
        base = user.premium_expires_at
    else:
        base = now

    user.premium_expires_at = (
        base + timedelta(days=30)
    )

    user.is_premium = True

    # --------------------------------------------------------
    # Save Paystack customer code
    # --------------------------------------------------------

    customer_code = (
        transaction
        .get("customer", {})
        .get("customer_code")
    )

    if customer_code:
        user.paystack_customer_code = customer_code

    db.commit()

    return True


# ============================================================
# MANUAL / FRONTEND VERIFICATION
# ============================================================

@router.get("/verify/{reference}")
async def verify_payment(
    reference: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Frontend can call this after Paystack redirects back.
    """

    granted = await _verify_and_grant(
        reference,
        db,
    )

    db.refresh(user)

    return {
        "granted": granted,
        "is_premium": user.is_premium,
        "premium_expires_at": (
            user.premium_expires_at
        ),
    }


# ============================================================
# PAYSTACK WEBHOOK
# ============================================================

@router.post("/webhook")
async def paystack_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Paystack server-to-server webhook.

    Signature is verified before processing.
    """

    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Payments aren't configured.",
        )

    body = await request.body()

    signature = request.headers.get(
        "x-paystack-signature",
        "",
    )

    expected = hmac.new(
        PAYSTACK_SECRET_KEY.encode(),
        body,
        hashlib.sha512,
    ).hexdigest()

    # --------------------------------------------------------
    # Verify Paystack signature
    # --------------------------------------------------------

    if not hmac.compare_digest(
        expected,
        signature,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid signature",
        )

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook payload",
        )

    # --------------------------------------------------------
    # Process successful payment
    # --------------------------------------------------------

    if event.get("event") == "charge.success":
        event_data = event.get("data", {})
        reference = event_data.get("reference")

        if reference:
            await _verify_and_grant(
                reference,
                db,
            )

    return {
        "received": True
    }
