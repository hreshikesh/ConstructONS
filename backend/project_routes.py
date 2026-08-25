"""Project routes — customer view + admin management.

Customer view: GET /api/portal/my-project
Admin CRUD: /api/admin/projects

Project has 10 fixed stages seeded on creation.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from db import db
from auth import require_admin
from customer_auth import get_current_customer

proj_router = APIRouter(prefix="/api", tags=["projects"])

DEFAULT_STAGES = [
    ("Discovery", "Understanding your brief, budget, style and site."),
    ("Design", "Floor plans, 3D elevations and interior direction approved."),
    ("Approvals", "Municipal sanctions, permits and utility clearances."),
    ("Booking", "Contract signed and advance payment received."),
    ("Site Preparation", "Excavation, marking and levelling on your plot."),
    ("Foundation", "Footings, plinth beams and DPC waterproofing."),
    ("Structure", "RCC columns, beams and slabs for every floor."),
    ("Walls & MEP", "Masonry, electrical, plumbing rough-ins."),
    ("Finishing", "Plaster, paint, flooring, joinery and interiors."),
    ("Handover", "Snags fixed, cleaning done, keys and documents handed over."),
]


def _default_stage_list() -> List[Dict[str, Any]]:
    return [{
        "index": i,
        "name": name,
        "description": desc,
        "status": "pending",
        "started_at": None,
        "completed_at": None,
        "expected_date": None,
        "progress_pct": 0,
        "photos": [],
        "documents": [],
        "notes": "",
    } for i, (name, desc) in enumerate(DEFAULT_STAGES)]


class ProjectCreateBody(BaseModel):
    customer_email: str
    customer_name: Optional[str] = None
    title: str = "My Home Project"
    address: Optional[str] = None
    package_slug: Optional[str] = None
    quote_id: Optional[str] = None


class StagePatchBody(BaseModel):
    status: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    expected_date: Optional[str] = None
    progress_pct: Optional[float] = None
    photos: Optional[List[str]] = None
    documents: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class ProjectUpdateBody(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    package_slug: Optional[str] = None
    quote_id: Optional[str] = None


# ---------------- Customer view ----------------
@proj_router.get("/portal/my-project")
async def portal_my_project(customer=Depends(get_current_customer)):
    email = (customer.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=404, detail="No project")
    proj = await db.projects.find_one({"customer_email": email}, {"_id": 0})
    return {"project": proj}


# ---------------- Admin CRUD ----------------
@proj_router.get("/admin/projects", dependencies=[Depends(require_admin)])
async def list_projects(q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if q:
        query["$or"] = [
            {"customer_email": {"$regex": q, "$options": "i"}},
            {"customer_name": {"$regex": q, "$options": "i"}},
            {"title": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return docs


@proj_router.get("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def get_project(project_id: str):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p


@proj_router.post("/admin/projects", dependencies=[Depends(require_admin)])
async def create_project(body: ProjectCreateBody):
    email = body.customer_email.lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="customer_email required")
    existing = await db.projects.find_one({"customer_email": email}, {"id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="Project already exists for this customer")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "customer_email": email,
        "customer_name": body.customer_name or email.split("@")[0],
        "title": body.title,
        "address": body.address,
        "package_slug": body.package_slug,
        "quote_id": body.quote_id,
        "status": "active",
        "stages": _default_stage_list(),
        "created_at": now,
        "updated_at": now,
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@proj_router.put("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def update_project(project_id: str, body: ProjectUpdateBody):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.projects.update_one({"id": project_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.projects.find_one({"id": project_id}, {"_id": 0})


@proj_router.patch("/admin/projects/{project_id}/stages/{index}", dependencies=[Depends(require_admin)])
async def patch_stage(project_id: str, index: int, body: StagePatchBody):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    stages = p.get("stages") or []
    if index < 0 or index >= len(stages):
        raise HTTPException(status_code=400, detail="Invalid stage index")
    stage = stages[index]
    patch = body.model_dump(exclude_unset=True)
    # Auto-timestamp
    if patch.get("status") == "in_progress" and not stage.get("started_at"):
        patch["started_at"] = datetime.now(timezone.utc).isoformat()
    if patch.get("status") == "completed" and not stage.get("completed_at"):
        patch["completed_at"] = datetime.now(timezone.utc).isoformat()
        patch["progress_pct"] = 100
    stage.update(patch)
    stages[index] = stage
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"stages": stages, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return stage


@proj_router.delete("/admin/projects/{project_id}", dependencies=[Depends(require_admin)])
async def delete_project(project_id: str):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}
