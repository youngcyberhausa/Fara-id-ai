import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Boolean
from .database import Base


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    """A registered user (email/password and/or Google sign-in)."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # null if Google-only account
    google_sub = Column(String, unique=True, nullable=True, index=True)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # Premium subscription (Paystack)
    is_premium = Column(Boolean, default=False)
    premium_expires_at = Column(DateTime, nullable=True)
    paystack_customer_code = Column(String, nullable=True)

    # Admin access (dashboard, announcements)
    is_admin = Column(Boolean, default=False)

    # Push notifications are ON by default. Android still requires the user
    # to grant the OS notification permission before FCM can display alerts.
    push_notifications_enabled = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class Payment(Base):
    """A Paystack payment transaction record."""
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    amount_kobo = Column(Float, nullable=False)  # amount in kobo (NGN * 100)
    status = Column(String, default="pending")  # pending | success | failed
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)


class Case(Base):
    """A single Fara'id (inheritance) case."""
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String, default="Untitled Case")

    # Step 1 - Estate
    estate_amount = Column(Float, nullable=False, default=0)
    currency = Column(String, default="NGN")

    # Step 2 - Deductions (funeral cost, debts)
    funeral_cost = Column(Float, default=0)
    debts = Column(Float, default=0)

    # Step 3 - Wasiyyah (bequest, max 1/3 of net estate after deductions)
    wasiyyah_amount = Column(Float, default=0)

    # Step 4 - Heirs (stored as JSON list of {type, count})
    heirs = Column(JSON, default=list)

    # Step 5 - Result (stored as JSON for quick recall, recomputed on demand too)
    result = Column(JSON, nullable=True)

    # Family Sharing: a public read-only token, set when the user enables sharing
    share_token = Column(String, unique=True, nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Announcement(Base):
    """An admin-authored broadcast — shown to every user (and guests) as a
    dismissible banner. Optionally includes a video (YouTube link or a
    direct video file URL). Only one announcement is "active" at a time."""
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    message = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DeviceToken(Base):
    """An FCM registration token belonging to a user's Android device."""
    __tablename__ = "device_tokens"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    platform = Column(String, default="android", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RubuuDinarPrice(Base):
    """Current Rubu'u Dinar price state.

    Rubu'u Dinar is calculated from the same live 24K gold price-per-gram
    source used by the app's Zakat calculator, multiplied by 1.0625 grams.
    """
    __tablename__ = "rubuu_dinar_price"

    id = Column(String, primary_key=True, default=lambda: "current")
    currency = Column(String, default="NGN", nullable=False)
    gold_price_per_gram = Column(Float, nullable=False)
    rubuu_dinar_price = Column(Float, nullable=False)
    previous_rubuu_dinar_price = Column(Float, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow)
    last_notified_price = Column(Float, nullable=True)


class RubuuDinarAlert(Base):
    """A record of a Rubu'u Dinar price alert delivered to a user."""
    __tablename__ = "rubuu_dinar_alerts"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    previous_price = Column(Float, nullable=True)
    direction = Column(String, nullable=False)  # up | down
    created_at = Column(DateTime, default=datetime.utcnow)
