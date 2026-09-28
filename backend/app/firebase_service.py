"""
Firebase Cloud Messaging service for Fara'id AI.

The Firebase service-account credential is read from an environment variable.
Never commit the service-account JSON/private key to GitHub.
"""
import base64
import json
import os
from typing import Iterable

import firebase_admin
from firebase_admin import credentials, messaging


_FIREBASE_APP = None


def firebase_is_configured() -> bool:
    return bool(
        os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        or os.environ.get("FIREBASE_SERVICE_ACCOUNT_B64")
    )


def _load_service_account() -> dict:
    raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if raw:
        return json.loads(raw)

    raw_b64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_B64")
    if raw_b64:
        return json.loads(base64.b64decode(raw_b64).decode("utf-8"))

    raise RuntimeError("Firebase service account is not configured")


def get_firebase_app():
    global _FIREBASE_APP
    if _FIREBASE_APP is not None:
        return _FIREBASE_APP

    if firebase_admin._apps:
        _FIREBASE_APP = firebase_admin.get_app()
        return _FIREBASE_APP

    service_account = _load_service_account()
    _FIREBASE_APP = firebase_admin.initialize_app(
        credentials.Certificate(service_account)
    )
    return _FIREBASE_APP


def send_rubuu_dinar_alert(
    tokens: Iterable[str],
    *,
    price: float,
    previous_price: float,
    currency: str = "NGN",
) -> tuple[set[str], set[str]]:
    """Send one FCM alert to up to many devices.

    Returns (successful_tokens, invalid_tokens). FCM accepts at most 500
    messages/tokens per multicast request, so the list is chunked.
    """
    token_list = list(dict.fromkeys(tokens))
    if not token_list:
        return set(), set()

    app = get_firebase_app()
    successful: set[str] = set()
    invalid: set[str] = set()

    direction = "up" if price > previous_price else "down"
    arrow = "📈" if direction == "up" else "📉"
    title = "Rubu'u Dinar Price Alert"
    body = (
        f"{arrow} Rubu'u Dinar is now {price:,.2f} {currency}. "
        f"Previous: {previous_price:,.2f} {currency}."
    )

    for start in range(0, len(token_list), 500):
        chunk = token_list[start : start + 500]
        message = messaging.MulticastMessage(
            tokens=chunk,
            notification=messaging.Notification(title=title, body=body),
            data={
                "type": "rubuu_dinar_price",
                "price": f"{price:.2f}",
                "previous_price": f"{previous_price:.2f}",
                "currency": currency,
                "direction": direction,
            },
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    channel_id="rubuu_dinar_alerts",
                    sound="default",
                ),
            ),
        )

        response = messaging.send_each_for_multicast(message, app=app)
        for token, result in zip(chunk, response.responses):
            if result.success:
                successful.add(token)
            else:
                exc = result.exception
                if isinstance(exc, messaging.UnregisteredError):
                    invalid.add(token)

    return successful, invalid
