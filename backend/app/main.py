from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import models
from .database import engine
from .routers import cases, auth, support, payments, admin, announcements, zakat, notifications, rubuu_dinar

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
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT TRUE",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS rubuu_dinar_currency VARCHAR(3) DEFAULT 'NGN'",
    "ALTER TABLE users ALTER COLUMN rubuu_dinar_currency SET DEFAULT 'NGN'",
    "UPDATE users SET rubuu_dinar_currency = 'NGN' WHERE rubuu_dinar_currency IS NULL",
    "ALTER TABLE cases ADD COLUMN IF NOT EXISTS share_token VARCHAR",
]
try:
    with engine.begin() as conn:
        for stmt in _MIGRATIONS:
            try:
                conn.execute(text(stmt))
            except Exception:
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
app.include_router(admin.router)
app.include_router(announcements.router)
app.include_router(zakat.router)
app.include_router(notifications.router)
app.include_router(rubuu_dinar.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
