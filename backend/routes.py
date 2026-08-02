from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from db import db, serialize_doc
from auth import require_admin, verify_admin_credentials, create_admin_token
from models import (
    Home, Package, Testimonial, FAQ, Blog, MarketplaceCategory,
    FinancialService, TeamMember, AIPlatformModule, JourneyStep,
    HeroSection, MediaItem, ComparisonRow, StatItem, SiteSettings,
    Lead, LeadCreate, now_iso, new_id
)

router = APIRouter(prefix="/api")


# ----------------------- helpers -----------------------
async def list_docs(collection: str, published_only: bool = True, sort_field: str = "sort_order"):
    q = {}
    if published_only:
        q["is_published"] = True
    docs = await db[collection].find(q, {"_id": 0}).sort(sort_field, 1).to_list(1000)
    return docs

async def get_doc(collection: str, id_or_slug: str, key: str = "id"):
    doc = await db[collection].find_one({key: id_or_slug}, {"_id": 0})
    if not doc:
        # try slug fallback
        doc = await db[collection].find_one({"slug": id_or_slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"{collection} not found")
    return doc

async def upsert_doc(collection: str, doc: Dict[str, Any]):
    doc["updated_at"] = now_iso()
    if not doc.get("id"):
        doc["id"] = new_id()
        doc["created_at"] = now_iso()
    await db[collection].update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    return doc

async def delete_doc(collection: str, id: str):
    result = await db[collection].delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


# ----------------------- Auth -----------------------
class AdminLoginReq(BaseModel):
    email: str
    password: str

@router.post("/admin/login")
async def admin_login(body: AdminLoginReq):
    if not verify_admin_credentials(body.email, body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_admin_token(body.email)
    return {"token": token, "email": body.email, "role": "admin"}

@router.get("/admin/me")
async def admin_me(user=Depends(require_admin)):
    return user


# ----------------------- Homes -----------------------
@router.get("/homes")
async def list_homes():
    return await list_docs("homes")

@router.get("/homes/{id_or_slug}")
async def get_home(id_or_slug: str):
    return await get_doc("homes", id_or_slug)

@router.post("/homes", dependencies=[Depends(require_admin)])
async def create_home(body: Home):
    return await upsert_doc("homes", body.model_dump())

@router.put("/homes/{id}", dependencies=[Depends(require_admin)])
async def update_home(id: str, body: Home):
    data = body.model_dump()
    data["id"] = id
    return await upsert_doc("homes", data)

@router.delete("/homes/{id}", dependencies=[Depends(require_admin)])
async def del_home(id: str):
    return await delete_doc("homes", id)


# ----------------------- Packages -----------------------
@router.get("/packages")
async def list_packages():
    return await list_docs("packages")

@router.get("/packages/{id_or_slug}")
async def get_package(id_or_slug: str):
    return await get_doc("packages", id_or_slug)

@router.post("/packages", dependencies=[Depends(require_admin)])
async def create_package(body: Package):
    return await upsert_doc("packages", body.model_dump())

@router.put("/packages/{id}", dependencies=[Depends(require_admin)])
async def update_package(id: str, body: Package):
    data = body.model_dump()
    data["id"] = id
    return await upsert_doc("packages", data)

@router.delete("/packages/{id}", dependencies=[Depends(require_admin)])
async def del_package(id: str):
    return await delete_doc("packages", id)


# ----------------------- Packages: Compare + Brochure -----------------------
@router.get("/packages-compare")
async def packages_compare():
    """Return all published packages side-by-side with unified spec categories."""
    pkgs = await db.packages.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    # Collect union of category names in order of first appearance
    cat_order = []
    seen = set()
    for p in pkgs:
        for c in (p.get("spec_categories") or []):
            n = c.get("name")
            if n and n not in seen:
                cat_order.append(n)
                seen.add(n)
    return {"packages": pkgs, "category_order": cat_order}


from fastapi.responses import Response  # noqa: E402


@router.get("/packages/{slug}/brochure.pdf")
async def download_brochure(slug: str):
    """Public endpoint — download PDF brochure for a package by slug or id."""
    pkg = await db.packages.find_one({"slug": slug}, {"_id": 0})
    if not pkg:
        pkg = await db.packages.find_one({"id": slug}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from brochure import generate_brochure
    pdf_bytes = generate_brochure(pkg, settings)
    filename = f"ConstructONS-{pkg.get('slug','package')}-brochure.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "public, max-age=300",
        },
    )


# ----------------------- Generic factory for simpler collections -----------------------
def make_crud(path: str, collection: str, ModelCls):
    @router.get(f"/{path}")
    async def _list():
        return await list_docs(collection)

    @router.get(f"/{path}/{{id_or_slug}}")
    async def _get(id_or_slug: str):
        return await get_doc(collection, id_or_slug)

    @router.post(f"/{path}", dependencies=[Depends(require_admin)])
    async def _create(body: ModelCls):
        return await upsert_doc(collection, body.model_dump())

    @router.put(f"/{path}/{{id}}", dependencies=[Depends(require_admin)])
    async def _update(id: str, body: ModelCls):
        data = body.model_dump()
        data["id"] = id
        return await upsert_doc(collection, data)

    @router.delete(f"/{path}/{{id}}", dependencies=[Depends(require_admin)])
    async def _delete(id: str):
        return await delete_doc(collection, id)


make_crud("testimonials", "testimonials", Testimonial)
make_crud("faqs", "faqs", FAQ)
make_crud("blogs", "blogs", Blog)
make_crud("marketplace-categories", "marketplace_categories", MarketplaceCategory)
make_crud("financial-services", "financial_services", FinancialService)
make_crud("team", "team_members", TeamMember)
make_crud("ai-modules", "ai_modules", AIPlatformModule)
make_crud("journey-steps", "journey_steps", JourneyStep)
make_crud("hero-sections", "hero_sections", HeroSection)
make_crud("media", "media", MediaItem)
make_crud("comparison", "comparison", ComparisonRow)
make_crud("stats", "stats", StatItem)


# ----------------------- Site Settings (singleton) -----------------------
@router.get("/site-settings")
async def get_site_settings():
    doc = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not doc:
        # initialize from defaults
        s = SiteSettings()
        await db.site_settings.insert_one(s.model_dump())
        return s.model_dump()
    return doc

@router.put("/site-settings", dependencies=[Depends(require_admin)])
async def update_site_settings(body: SiteSettings):
    body.id = "site_settings"
    doc = body.model_dump()
    await db.site_settings.update_one({"id": "site_settings"}, {"$set": doc}, upsert=True)
    return doc


# ----------------------- Leads -----------------------
@router.post("/leads")
async def create_lead(body: LeadCreate):
    lead = Lead(**body.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return {"success": True, "id": lead.id, "message": "Thank you! Our team will reach out shortly."}

@router.get("/leads", dependencies=[Depends(require_admin)])
async def list_leads(status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

@router.put("/leads/{id}", dependencies=[Depends(require_admin)])
async def update_lead(id: str, body: LeadUpdate):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = now_iso()
    result = await db.leads.update_one({"id": id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}

@router.delete("/leads/{id}", dependencies=[Depends(require_admin)])
async def del_lead(id: str):
    return await delete_doc("leads", id)


# ----------------------- Aggregated bootstrap endpoint -----------------------
@router.get("/bootstrap")
async def bootstrap():
    """Return everything the homepage needs in one call."""
    async def _list(c, sort="sort_order", published=True):
        q = {"is_published": True} if published else {}
        return await db[c].find(q, {"_id": 0}).sort(sort, 1).to_list(1000)

    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    hero_list = await _list("hero_sections")
    hero = next((h for h in hero_list if h.get("key") == "home_hero"), (hero_list[0] if hero_list else None))
    return {
        "site_settings": settings or SiteSettings().model_dump(),
        "hero": hero,
        "homes": await _list("homes"),
        "packages": await _list("packages"),
        "ai_modules": await _list("ai_modules"),
        "marketplace": await _list("marketplace_categories"),
        "financial_services": await _list("financial_services"),
        "comparison": await _list("comparison"),
        "journey": await _list("journey_steps"),
        "testimonials": await _list("testimonials"),
        "stats": await _list("stats"),
        "faqs": await _list("faqs"),
        "team": await _list("team_members"),
    }


@router.get("/")
async def root():
    return {"service": "ConstructONS CMS API", "status": "ok"}
