"""
Auth helpers: password hashing, JWT and secure password-reset tokens.
"""
import os
import hmac
import hashlib
import base64
import time
import secrets
from typing import Optional

import jwt

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 60 * 60 * 24 * 30

PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}$"
        f"{base64.b64encode(salt).decode()}$"
        f"{base64.b64encode(dk).decode()}"
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt_b64, hash_b64 = stored.split("$")
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)

        dk = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            int(iterations),
        )

        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


def create_access_token(user_id: str) -> str:
    now = int(time.time())

    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + JWT_EXPIRE_SECONDS,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def generate_reset_token() -> str:
    """
    Cryptographically secure URL-safe token.
    The raw token is sent only to the user's email.
    """
    return secrets.token_urlsafe(48)


def hash_reset_token(token: str) -> str:
    """
    SHA-256 hash stored in the database.
    Raw reset token is never stored.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_reset_token(token: str, stored_hash: str) -> bool:
    """
    Constant-time comparison of token hashes.
    """
    if not token or not stored_hash:
        return False

    candidate = hash_reset_token(token)

    return hmac.compare_digest(candidate, stored_hash)


def generate_otp_code() -> str:
    """
    Kept for account deletion confirmation.
    """
    return f"{secrets.randbelow(1_000_000):06d}"
