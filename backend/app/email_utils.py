"""
Minimal SMTP email sender. Configure via environment variables:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
If SMTP_HOST is not set, emails are just printed to the server logs
(useful for local dev / before you've wired up a real mail provider).
"""
import os
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER or "no-reply@faraid.ai")


def send_password_reset_otp(to_email: str, otp: str) -> None:
    subject = "Your Fara'id AI verification code"
    body = (
        f"Assalamu alaikum,\n\n"
        f"Someone requested a password reset for this email on Fara'id AI.\n"
        f"Your verification code is:\n\n{otp}\n\n"
        f"This code expires in 10 minutes. If you didn't request this, "
        f"you can safely ignore this email.\n"
    )

    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        # Not configured yet — log so it's visible in the deploy logs
        # during setup/testing, instead of silently failing.
        print(f"[email:not-configured] Password reset OTP for {to_email}: {otp}")
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, [to_email], msg.as_string())
