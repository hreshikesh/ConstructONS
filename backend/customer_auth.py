"""Customer-facing auth via Emergent Google OAuth.

Separate from admin auth. Uses its own `customer_session` httpOnly cookie
and `customers` + `customer_sessions` collections.
"""
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import HTTPException, Request, Response, Depends
from pydantic import BaseModel

from db import db

logger = logging.getLogger(__name__)

COOKIE_NAME = "customer_session"
SESSION_DAYS = 7
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


class ProcessSessionBody(BaseModel):
    session_id: str


async def _upsert_customer(email: str, name: str, picture: Optional[str]) -> dict:
    existing = await db.customers.find_one({"email": email}, {"_id": 0})
    now = datetime.now(timezone.utc).isoformat()
    if existing:
        await db.customers.update_one(
            {"user_id": existing["user_id"]},
            {"$set": {"name": name, "picture": picture, "updated_at": now}},
        )
        return {**existing, "name": name, "picture": picture, "updated_at": now}
    user_id = f"cust_{uuid.uuid4().hex[:16]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": "customer",
        "created_at": now,
        "updated_at": now,
    }
    await db.customers.insert_one(doc)
    return doc


async def _create_session(user_id: str, session_token: str) -> dict:
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    }
    # Replace any existing session for this user_id + token pair
    await db.customer_sessions.update_one(
        {"session_token": session_token},
        {"$set": doc},
        upsert=True,
    )
    return doc


def _set_session_cookie(resp: Response, session_token: str) -> None:
    resp.set_cookie(
        key=COOKIE_NAME,
        value=session_token,
        max_age=SESSION_DAYS * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def _clear_session_cookie(resp: Response) -> None:
    resp.delete_cookie(COOKIE_NAME, path="/", samesite="none", secure=True)


async def process_google_session(body: ProcessSessionBody, resp: Response) -> dict:
    """Exchange an Emergent Auth session_id for our own session cookie."""
    if not body.session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                EMERGENT_SESSION_URL,
                headers={"X-Session-ID": body.session_id},
            )
            if r.status_code != 200:
                logger.error(f"[customer-auth] session-data failed {r.status_code}: {r.text[:200]}")
                raise HTTPException(status_code=401, detail="Invalid or expired session_id")
            data = r.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[customer-auth] emergent call error: {e}")
        raise HTTPException(status_code=502, detail="Auth provider unreachable")

    email = (data.get("email") or "").lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=502, detail="Auth provider returned incomplete data")

    customer = await _upsert_customer(email, name, picture)
    await _create_session(customer["user_id"], session_token)
    _set_session_cookie(resp, session_token)

    return {
        "user_id": customer["user_id"],
        "email": customer["email"],
        "name": customer["name"],
        "picture": customer["picture"],
    }


async def get_current_customer(request: Request) -> dict:
    """Return current customer from the session cookie, else 401."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        # Fallback: bearer
        auth = request.headers.get("Authorization") or ""
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await db.customer_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Session not found")
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    customer = await db.customers.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=401, detail="Customer not found")
    return customer


async def logout_customer(request: Request, resp: Response) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.customer_sessions.delete_one({"session_token": token})
    _clear_session_cookie(resp)
    return {"success": True}
