"""
Email utilities for Fara'id AI using Brevo Transactional Email API.
"""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "").strip()
SMTP_FROM = os.environ.get("SMTP_FROM", "").strip()
FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://fara-id-ai.vercel.app",
).rstrip("/")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not BREVO_API_KEY:
        raise RuntimeError("BREVO_API_KEY is not configured.")

    if not SMTP_FROM:
        raise RuntimeError("SMTP_FROM verified sender email is not configured.")

    payload = {
        "sender": {
            "name": "Fara'id AI",
            "email": SMTP_FROM,
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "textContent": body,
    }

    headers = {
        "api-key": BREVO_API_KEY,
        "accept": "application/json",
        "content-type": "application/json",
    }

    with httpx.Client(timeout=20.0) as client:
        response = client.post(
            BREVO_API_URL,
            json=payload,
            headers=headers,
        )

    if response.status_code not in (200, 201, 202):
        logger.error(
            "Brevo email API failed: HTTP %s; response: %s",
            response.status_code,
            response.text[:500],
        )
        raise RuntimeError(
            f"Brevo email API returned HTTP {response.status_code}."
        )

    logger.info("Email accepted by Brevo Transactional Email API.")


def send_password_reset_link(to_email: str, token: str) -> None:
    """Send a one-time password-reset link."""

    reset_link = f"{FRONTEND_URL}/?reset_token={token}"

    subject = "Reset your Fara'id AI password"

    body = (
        "Assalamu alaikum,\n\n"
        "We received a request to reset your Fara'id AI password.\n\n"
        "Open this secure link to choose a new password:\n\n"
        f"{reset_link}\n\n"
        "This link expires in 30 minutes and can only be used once.\n\n"
        "If you did not request a password reset, you can ignore this email.\n\n"
        "Fara'id AI"
    )

    _send_email(to_email, subject, body)


def send_account_deletion_otp(to_email: str, otp: str) -> None:
    """Send the account-deletion confirmation OTP."""

    subject = "Confirm deletion of your Fara'id AI account"

    body = (
        "Assalamu alaikum,\n\n"
        "Someone requested permanent deletion of this Fara'id AI account "
        "and its saved cases.\n\n"
        f"Your confirmation code is:\n\n{otp}\n\n"
        "This code expires in 10 minutes.\n\n"
        "If you did not request this, you can ignore this email. "
        "Your account will not be touched.\n\n"
        "This action cannot be undone once confirmed.\n"
    )

    _send_email(to_email, subject, body)
