import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Railway's Postgres plugin provides a DATABASE_URL env var. If it's not
# set (e.g. local development), we fall back to a local SQLite file — but
# note that SQLite on Railway's filesystem does NOT persist across
# redeploys, so production should always have DATABASE_URL configured.
_raw_url = os.environ.get("DATABASE_URL")

if _raw_url:
    # SQLAlchemy 2.x requires the "postgresql://" scheme; some providers
    # (Railway included, historically) hand out "postgres://".
    if _raw_url.startswith("postgres://"):
        _raw_url = _raw_url.replace("postgres://", "postgresql://", 1)
    # Use the psycopg (v3) driver explicitly — it has prebuilt wheels for
    # modern Python versions, unlike psycopg2 which can fail to build from
    # source on newer interpreters (e.g. Python 3.13).
    if _raw_url.startswith("postgresql://"):
        _raw_url = _raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    DATABASE_URL = _raw_url
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    DATABASE_URL = "sqlite:///./faraid.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
