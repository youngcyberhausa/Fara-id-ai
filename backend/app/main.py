from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import models
from .database import engine
from .routers import cases, auth, support, payments

models.Base.metadata.create_all(bind=engine)

# `create_all` only creates brand-new tables — it never alters tables that
# already exist. Since this app has no formal migration tool (Alembic) set
# up, we run small idempotent "add column if missing" statements here so
# that new fields added to existing models (e.g. premium fields on users)
# actually reach the live database on every deploy.
_MIGRATIONS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR",
    "ALTER TABLE cases ADD COLUMN IF NOT EXISTS share_token VARCHAR",
]
try:
    with engine.begin() as conn:
        for stmt in _MIGRATIONS:
            try:
                conn.execute(text(stmt))
            except Exception:
                # SQLite (local dev) doesn't support "IF NOT EXISTS" on
                # ADD COLUMN in older versions — safe to ignore there since
                # local dev DBs are disposable and get created fresh anyway.
                pass
except Exception:
    pass

app = FastAPI(title="Fara'id AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(support.router)
app.include_router(payments.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
