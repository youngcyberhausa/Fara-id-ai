"""
Email utilities.

Configure SMTP using:
  SMTP_HOST
  SMTP_PORT
  SMTP_USER
  SMTP_PASS
  SMTP_FROM

Password reset uses a secure one-time link instead of OTP.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
SMTP_FROM = os.environ.get(
    "SMTP_FROM",
    SMTP_USER or "no-reply@faraid.ai",
)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://fara-id-ai.onrender.com",
).rstrip("/")


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        print(
            f"[email:not-configured] "
            f"To={to_email} Subject={subject}\n{body}"
        )
        return

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(
            SMTP_FROM,
            [to_email],
            msg.as_string(),
        )


def send_password_reset_link(to_email: str, token: str) -> None:
    """
    Sends the secure password-reset link.

    The raw token is only included in the email.
    It is never stored in the database.
    """

    reset_link = f"{FRONTEND_URL}/?reset_token={token}"

    subject = "Reset your Fara'id AI password"

    body = (
        "Assalamu alaikum,\n\n"
        "We received a request to reset your Fara'id AI password.\n\n"
        "Open the secure link below to choose a new password:\n\n"
        f"{reset_link}\n\n"
        "This link expires in 30 minutes and can only be used once.\n\n"
        "If you did not request a password reset, you can safely ignore "
        "this email.\n\n"
        "Fara'id AI"
    )

    _send_email(
        to_email,
        subject,
        body,
    )


def send_account_deletion_otp(to_email: str, otp: str) -> None:
    subject = "Confirm deletion of your Fara'id AI account"

    body = (
        "Assalamu alaikum,\n\n"
        "Someone requested permanent deletion of this Fara'id AI account "
        "and all its saved cases.\n\n"
        f"Your confirmation code is:\n\n{otp}\n\n"
        "This code expires in 10 minutes.\n\n"
        "If you didn't request this, you can safely ignore this email. "
        "Your account will not be touched.\n\n"
        "This action cannot be undone once confirmed.\n"
    )

    _send_email(
        to_email,
        subject,
        body,
    )
