"""
Email utilities for Fara'id AI using Resend API.
"""

import os
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_FROM = os.environ.get(
    "RESEND_FROM",
    "Fara'id AI <onboarding@resend.dev>",
)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://fara-id-ai.onrender.com",
).rstrip("/")


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY is not configured.")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "text": body,
    }

    response = resend.Emails.send(params)

    if not response or not response.get("id"):
        raise RuntimeError("Resend did not confirm email submission.")

    logger.info("Email accepted by Resend. Message ID: %s", response["id"])


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
