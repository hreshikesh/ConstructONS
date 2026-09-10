"""
ConstructONS Storage Service.
Primary: Cloudinary Cloud Storage (if env vars set)
Fallback: Local Disk Storage (saved to backend/uploads/)
"""
import os
import uuid
import logging
from pathlib import Path
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

# Constants required by routes.py
ALLOWED_MIME_PREFIXES = ("image/", "application/pdf")
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB limit

# Local disk fallback directory
LOCAL_UPLOADS_DIR = Path(__file__).parent / "uploads"
LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Cloudinary Config
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

USE_CLOUDINARY = bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)

if USE_CLOUDINARY:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )
        logger.info("[media] Production Cloudinary Storage Initialized")
    except ImportError:
        logger.warning("[media] cloudinary package not installed — using local disk storage.")
        USE_CLOUDINARY = False


def init_storage() -> Optional[str]:
    """Startup lifespan hook compatibility."""
    return "cloudinary" if USE_CLOUDINARY else "local"


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Uploads file to Cloudinary if configured, otherwise saves to local disk."""
    if USE_CLOUDINARY:
        try:
            folder = f"constructons/{path.split('/')[1]}" if "/" in path else "constructons"
            res = cloudinary.uploader.upload(
                data,
                folder=folder,
                resource_type="auto"
            )
            return {
                "path": path,
                "url": res.get("secure_url"),
                "storage": "cloudinary"
            }
        except Exception as e:
            logger.error(f"[media] Cloudinary upload failed ({e}) — falling back to local disk")

    # Local Disk Fallback
    file_path = LOCAL_UPLOADS_DIR / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(data)
    
    return {
        "path": path,
        "url": f"/api/media/{path}",
        "storage": "local"
    }


def get_object(path: str) -> Tuple[bytes, str]:
    """Retrieve file bytes from local disk."""
    file_path = LOCAL_UPLOADS_DIR / path
    if file_path.exists():
        with open(file_path, "rb") as f:
            content = f.read()
        ext = file_path.suffix.lstrip(".").lower()
        if ext in ("jpg", "jpeg"):
            ct = "image/jpeg"
        elif ext == "png":
            ct = "image/png"
        elif ext == "webp":
            ct = "image/webp"
        elif ext == "pdf":
            ct = "application/pdf"
        else:
            ct = "application/octet-stream"
        return content, ct

    raise FileNotFoundError(f"File {path} not found on local disk")


def build_storage_path(category: str, filename: str, content_type: str) -> str:
    MIME_TO_EXT = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "application/pdf": "pdf",
    }
    ext = MIME_TO_EXT.get((content_type or "").lower())
    if not ext:
        ext = (filename.rsplit(".", 1)[-1] if "." in filename else "bin").lower()
    safe_category = "".join(c for c in category if c.isalnum() or c in "-_") or "general"
    return f"constructons/{safe_category}/{uuid.uuid4()}.{ext}"