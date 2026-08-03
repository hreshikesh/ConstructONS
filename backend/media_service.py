"""Emergent Object Storage helper for image / file uploads.

Session-scoped storage_key is initialised once at startup and reused for
all subsequent PUT / GET calls. All object paths are prefixed with the
app name (`constructons/`) to isolate our bucket.
"""
import os
import uuid
import logging
import requests
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "constructons"

_storage_key: Optional[str] = None

ALLOWED_MIME_PREFIXES = ("image/",)
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB per image

MIME_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
}


def init_storage() -> Optional[str]:
    """Init once at startup. Safe to call repeatedly — returns cached key."""
    global _storage_key
    if _storage_key:
        return _storage_key
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.error("[media] EMERGENT_LLM_KEY not set — object storage disabled")
        return None
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": api_key},
            timeout=30,
        )
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        logger.info("[media] object storage initialised")
        return _storage_key
    except Exception as e:
        logger.error(f"[media] object storage init failed: {e}")
        _storage_key = None
        return None


def _reinit_and_get():
    global _storage_key
    _storage_key = None
    return init_storage()


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise RuntimeError("Object storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 403:
        # Session token expired — refresh and retry once
        key = _reinit_and_get()
        if not key:
            raise RuntimeError("Object storage session expired")
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> Tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise RuntimeError("Object storage unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 403:
        key = _reinit_and_get()
        if not key:
            raise RuntimeError("Object storage session expired")
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def build_storage_path(category: str, filename: str, content_type: str) -> str:
    ext = MIME_TO_EXT.get((content_type or "").lower())
    if not ext:
        # fall back to filename extension
        ext = (filename.rsplit(".", 1)[-1] if "." in filename else "bin").lower()
    safe_category = "".join(c for c in category if c.isalnum() or c in "-_") or "general"
    return f"{APP_NAME}/{safe_category}/{uuid.uuid4()}.{ext}"
