import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
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
    created_at = Column(DateTime, default=datetime.utcnow)


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

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
