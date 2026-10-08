import re
import uuid
import logging
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from db import db

logger = logging.getLogger(__name__)

try:
    from auth import COOKIE_NAME
except ImportError:
    COOKIE_NAME = "cons_admin_token"

import jwt


class GlobalAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Process request normally first (never blocks response)
        response = await call_next(request)

        # 2. Only track successful mutation requests
        if request.method not in ["POST", "PUT", "PATCH", "DELETE"] or not (200 <= response.status_code < 300):
            return response

        try:
            path = request.url.path
            match = re.search(r"/api/admin/projects/([^/]+)(?:/([^/]+))?", path)
            if not match:
                return response

            project_id = match.group(1)
            sub_module = match.group(2) or "settings"

            # Skip sub-operations that have custom handlers
            if sub_module in ["attendance", "reorder"]:
                return response

            # 3. Identify admin from cookie payload
            admin_name = "System Admin"
            token = request.cookies.get(COOKIE_NAME) or request.headers.get("Authorization", "").replace("Bearer ", "")
            if token:
                try:
                    payload = jwt.decode(token, options={"verify_signature": False})
                    admin_name = payload.get("email") or payload.get("sub") or "Admin"
                except Exception:
                    pass

            # 4. Human-readable action mapping
            action_verbs = {
                "POST": "Added new item in",
                "PUT": "Updated details in",
                "PATCH": "Modified record in",
                "DELETE": "Deleted record from"
            }
            verb = action_verbs.get(request.method, "Updated")
            module_title = sub_module.replace("_", " ").capitalize()

            action_text = f"{verb} {module_title}"
            if "decision" in path or "approve" in path:
                action_text = f"Logged decision in {module_title}"

            activity = {
                "id": str(uuid.uuid4()),
                "user_name": admin_name,
                "action": action_text,
                "module": module_title,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            # 5. Non-blocking DB log insert
            import asyncio
            asyncio.create_task(
                db.projects.update_one(
                    {"id": project_id},
                    {"$push": {"activities": {"$each": [activity], "$slice": -100}}}
                )
            )
        except Exception as e:
            logger.warning(f"[Audit Middleware Warning] {e}")

        return response