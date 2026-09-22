import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import hash_password, verify_password, create_access_token, generate_otp_code
from ..deps import get_current_user
from ..email_utils import send_password_reset_otp, send_account_deletion_otp

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
RESET_TOKEN_TTL_MINUTES = 10


@router.post("/register", response_model=schemas.TokenResponse)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = models.User(
        email=email,
        name=req.name,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=user)


@router.post("/google", response_model=schemas.TokenResponse)
def google_auth(req: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured on the server yet (missing GOOGLE_CLIENT_ID).",
        )
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        info = google_id_token.verify_oauth2_token(
            req.id_token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token.")

    google_sub = info["sub"]
    email = info.get("email", "").strip().lower()
    name = info.get("name")

    user = db.query(models.User).filter(models.User.google_sub == google_sub).first()
    if not user and email:
        user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        user = models.User(email=email, name=name, google_sub=google_sub)
        db.add(user)
    else:
        if not user.google_sub:
            user.google_sub = google_sub
        if name and not user.name:
            user.name = name

    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()

    # Always return the same generic message, whether or not the account
    # exists — this avoids leaking which emails are registered.
    generic_response = {
        "message": "If an account exists for that email, a verification code has been sent."
    }

    if not user:
        return generic_response

    otp = generate_otp_code()
    user.reset_token = otp
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    db.commit()

    try:
        send_password_reset_otp(user.email, otp)
    except Exception:
        # Don't leak SMTP failures to the client; the generic message still
        # applies. The server logs will show the failure for debugging.
        pass

    return generic_response


def _get_valid_otp_user(db: Session, email: str, otp: str) -> models.User:
    email = email.strip().lower()
    user = (
        db.query(models.User)
        .filter(models.User.email == email, models.User.reset_token == otp)
        .first()
    )
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This code is invalid or has expired.")
    return user


@router.post("/verify-otp")
def verify_otp(req: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    _get_valid_otp_user(db, req.email, req.otp)
    return {"valid": True}


@router.post("/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = _get_valid_otp_user(db, req.email, req.otp)

    user.password_hash = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Your password has been reset."}


def _erase_user_and_data(db: Session, user: models.User) -> None:
    """Permanently deletes a user and everything tied to their account
    (saved cases, payment records). No FK cascade is configured at the DB
    level, so children are removed explicitly first."""
    db.query(models.Case).filter(models.Case.user_id == user.id).delete()
    db.query(models.Payment).filter(models.Payment.user_id == user.id).delete()
    db.delete(user)
    db.commit()


@router.delete("/account")
def delete_my_account(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Signed-in account deletion — used by the in-app 'Delete account'
    button. Permanently removes the account and all saved cases."""
    _erase_user_and_data(db, user)
    return {"message": "Your account and all saved cases have been permanently deleted."}


@router.post("/request-account-deletion")
def request_account_deletion(req: schemas.RequestAccountDeletionRequest, db: Session = Depends(get_db)):
    """Public, no-login-required entry point (used by the /delete-account
    web page) so a user can request deletion even without the app
    installed, per Google Play's Account Deletion policy."""
    email = req.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()

    generic_response = {
        "message": "If an account exists for that email, a confirmation code has been sent."
    }

    if not user:
        return generic_response

    otp = generate_otp_code()
    user.reset_token = otp
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    db.commit()

    try:
        send_account_deletion_otp(user.email, otp)
    except Exception:
        pass

    return generic_response


@router.post("/confirm-account-deletion")
def confirm_account_deletion(req: schemas.ConfirmAccountDeletionRequest, db: Session = Depends(get_db)):
    user = _get_valid_otp_user(db, req.email, req.otp)
    _erase_user_and_data(db, user)
    return {"message": "Your account and all saved cases have been permanently deleted."}
