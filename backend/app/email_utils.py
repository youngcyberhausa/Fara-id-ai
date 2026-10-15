"""
Email utilities for Fara'id AI using Brevo SMTP.
"""

import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://fara-id-ai.vercel.app",
).rstrip("/")


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not SMTP_USER or not SMTP_PASS:
        raise RuntimeError("Brevo SMTP credentials are not configured.")

    message = EmailMessage()
    message["From"] = SMTP_FROM
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(message)

    logger.info("Email submitted successfully through Brevo SMTP.")


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
