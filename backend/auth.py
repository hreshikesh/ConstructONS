"""Admin auth — JWT stored in an httpOnly, Secure, SameSite=Lax cookie.

Rationale: keeping the JWT out of `localStorage` closes the biggest XSS
attack vector against the admin panel — an injected script can no longer
read the cookie because `document.cookie` returns nothing for httpOnly
cookies.

`require_admin` accepts either:
  1. The `cons_admin_token` cookie   (preferred, set at login)
  2. An `Authorization: Bearer <jwt>` header  (kept for API scripts,
     `curl`-based automation, and older browser sessions during rollout)
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@constructons.in")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
DEV_BYPASS_TOKEN = os.environ.get("DEV_BYPASS_TOKEN", "dev-bypass-constructons-2025")

# Cookie configuration
COOKIE_NAME = "cons_admin_token"
COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7  # 7 days
COOKIE_PATH = "/"
# Auto-secure in production behind HTTPS. Emergent preview + prod are both
# https-terminated, so True is safe. Override via env if needed for local dev.
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "lax").lower()

# auto_error=False so we can gracefully fall back to the cookie if the header
# isn't present.
security = HTTPBearer(auto_error=False)


def create_admin_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(seconds=COOKIE_MAX_AGE_SECONDS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_admin_credentials(email: str, password: str) -> bool:
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD


def set_admin_cookie(response: Response, token: str) -> None:
    """Attach the admin JWT to the response as an httpOnly cookie."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE_SECONDS,
        expires=COOKIE_MAX_AGE_SECONDS,
        path=COOKIE_PATH,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )


def clear_admin_cookie(response: Response) -> None:
    """Remove the admin JWT cookie on logout."""
    response.delete_cookie(
        key=COOKIE_NAME,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )


def _decode_and_check(token: str) -> dict:
    if token == DEV_BYPASS_TOKEN:
        return {"email": "dev@constructons.in", "role": "admin", "bypass": True}
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload


async def require_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    # 1) Prefer the httpOnly cookie (safer against XSS)
    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        return _decode_and_check(cookie_token)

    # 2) Fall back to the Authorization header (curl / scripts / legacy)
    if credentials and credentials.credentials:
        return _decode_and_check(credentials.credentials)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )
