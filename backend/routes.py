from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form, Response, Header, Request
from fastapi.responses import Response as FastAPIResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from db import db, serialize_doc
from auth import (
    require_admin, verify_admin_credentials, create_admin_token,
    set_admin_cookie, clear_admin_cookie, COOKIE_NAME,
)
from models import (
    Home, Package, Testimonial, FAQ, Blog, MarketplaceCategory,
    FinancialService, TeamMember, AIPlatformModule, JourneyStep,
    HeroSection, MediaItem, ComparisonRow, StatItem, SiteSettings,
    Lead, LeadCreate, QuizSubmission, Proposal, CustomQuote, QuoteTemplate,
    InteriorLibraryItem, now_iso, new_id
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
async def admin_login(body: AdminLoginReq, response: FastAPIResponse):
    if not await verify_admin_credentials(body.email, body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_admin_token(body.email)
    set_admin_cookie(response, token)
    return {"token": token, "email": body.email, "role": "admin"}


@router.post("/admin/logout")
async def admin_logout(response: FastAPIResponse):
    """Clear the httpOnly admin cookie. Safe to call even if not logged in."""
    clear_admin_cookie(response)
    return {"success": True}


@router.get("/admin/me")
async def admin_me(user=Depends(require_admin)):
    return user


@router.post("/admin/reseed", dependencies=[Depends(require_admin)])
async def admin_reseed():
    """Force-reseed all collections from `seed.py`. Useful when a fresh
    deployment lands on an empty (or partially-empty) database and the
    startup auto-seed didn't catch it — the admin can call this once to
    restore the full content baseline without a redeploy.
    """
    from seed import seed_all
    await seed_all()
    counts = {}
    for coll in [
        "homes", "packages", "hero_sections", "site_settings",
        "financial_services", "marketplace_categories", "ai_modules",
        "comparison", "stats", "journey_steps", "testimonials",
        "faqs", "blogs", "team_members", "media",
    ]:
        counts[coll] = await db[coll].count_documents({})
    return {"success": True, "counts": counts}


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
    # Snapshot current state BEFORE writing the update so the admin can undo.
    await _snapshot_package(id, note="edit")
    data = body.model_dump()
    data["id"] = id
    return await upsert_doc("packages", data)

@router.delete("/packages/{id}", dependencies=[Depends(require_admin)])
async def del_package(id: str):
    # Snapshot before delete too — restores can bring the package back.
    await _snapshot_package(id, note="pre-delete")
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


from fastapi.responses import Response as FastAPIResponse  # noqa: E402,F811


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
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "public, max-age=300",
        },
    )


class PersonalizedBrochureRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    message: Optional[str] = None
    save_lead: bool = True
    quiz_submission_id: Optional[str] = None


@router.post("/packages/{slug}/brochure")
async def personalized_brochure(slug: str, body: PersonalizedBrochureRequest):
    """Public endpoint — creates a lead + generates PERSONALIZED PDF brochure.
    Returns the PDF bytes directly."""
    pkg = await db.packages.find_one({"slug": slug}, {"_id": 0})
    if not pkg:
        pkg = await db.packages.find_one({"id": slug}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from models import Lead
    year = datetime.now(timezone.utc).strftime("%y")
    lead_count = await db.leads.count_documents({})
    seq = str(lead_count + 1).zfill(4)
    tier_code = (pkg.get("tier") or pkg.get("slug", "pkg"))[:4].upper()
    quote_ref = f"CONS-{year}-{tier_code}-{seq}"

    lead_id = None
    if body.save_lead:
        lead = Lead(
            name=body.name,
            phone=body.phone,
            email=body.email,
            city=body.city,
            message=body.message or f"Requested personalised brochure ({pkg.get('name')})",
            interested_package=pkg.get("name"),
            source="brochure_download",
            quote_ref=quote_ref,
            quiz_submission_id=body.quiz_submission_id,
        )
        lead_doc = lead.model_dump()
        await db.leads.insert_one(lead_doc)
        lead_id = lead.id

    # Link quiz submission
    if body.quiz_submission_id:
        await db.quiz_submissions.update_one(
            {"id": body.quiz_submission_id},
            {"$set": {
                "converted_to_lead_id": lead_id,
                "contact_name": body.name,
                "contact_phone": body.phone,
                "contact_email": body.email,
                "contact_city": body.city,
                "status": "converted" if lead_id else "contact_captured",
                "updated_at": now_iso(),
            }},
        )

    personalization = {
        "customer_name": body.name,
        "quote_ref": quote_ref,
        "customer_city": body.city,
    }

    from brochure import generate_brochure
    pdf_bytes = generate_brochure(pkg, settings, personalization=personalization)
    filename = f"ConstructONS-{pkg.get('slug','package')}-{quote_ref}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Quote-Ref": quote_ref,
            "Access-Control-Expose-Headers": "X-Quote-Ref, Content-Disposition",
        },
    )


# ----------------------- Package Recommender -----------------------
class RecommendRequest(BaseModel):
    budget: str  # 'value' | 'balanced' | 'premium' | 'luxury'
    family_size: str  # '1-2' | '3-4' | '5+' 
    style: Optional[str] = None  # 'modern' | 'classic' | 'villa' | 'duplex' | 'any'
    smart_home: str = "no"  # 'no' | 'basic' | 'full'


@router.post("/recommend")
async def recommend_package(body: RecommendRequest):
    """Score all packages against user preferences and return recommendation + shortlisted homes."""
    packages = await db.packages.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(20)
    homes = await db.homes.find({"is_published": True}, {"_id": 0}).sort("sort_order", 1).to_list(50)

    budget_map = {
        "value": "basic",
        "balanced": "essential",
        "premium": "standard",
        "luxury": "premium",
    }
    smart_map = {"no": "basic", "basic": "standard", "full": "premium"}
    ideal_by_budget = budget_map.get(body.budget, "essential")
    ideal_by_smart = smart_map.get(body.smart_home, "essential")

    # Score
    tier_order = {"basic": 1, "essential": 2, "standard": 3, "premium": 4}
    ideal_score = max(tier_order.get(ideal_by_budget, 2), tier_order.get(ideal_by_smart, 2))

    scored = []
    for p in packages:
        tier = p.get("tier", "basic")
        tscore = tier_order.get(tier, 1)
        # closer to ideal_score is better; equal is best, 1-away ok, 2+ penalised
        diff = abs(tscore - ideal_score)
        base = 100 - diff * 30
        # Prefer tiers matching budget over smart_home
        if tier == ideal_by_budget:
            base += 10
        scored.append((base, p))

    scored.sort(key=lambda x: -x[0])
    best = scored[0][1]

    # Filter homes: package compatibility + family size + style
    def bhk_min(fs):
        if fs == "1-2": return 2
        if fs == "3-4": return 3
        if fs == "5+": return 4
        return 2

    needed_bhk = bhk_min(body.family_size)

    def home_matches(h):
        pkg_names = [pc.lower() for pc in (h.get("package_compatibility") or [])]
        if best.get("tier") and best["tier"] not in pkg_names and best.get("name", "").split()[0].lower() not in pkg_names:
            return False
        if (h.get("bedrooms") or 0) < needed_bhk:
            return False
        if body.style and body.style != "any":
            if (h.get("style") or "").lower() != body.style.lower():
                return False
        return True

    shortlist = [h for h in homes if home_matches(h)]
    if not shortlist:
        # Relax the style filter
        shortlist = [h for h in homes if (h.get("bedrooms") or 0) >= needed_bhk]
    shortlist = shortlist[:3]

    # Persist submission for the sales team
    submission = QuizSubmission(
        budget=body.budget,
        family_size=body.family_size,
        style=body.style,
        smart_home=body.smart_home,
        recommended_package_slug=best.get("slug"),
        recommended_package_name=best.get("name"),
        shortlisted_home_slugs=[h.get("slug") for h in shortlist if h.get("slug")],
        shortlisted_home_names=[h.get("name") for h in shortlist if h.get("name")],
        score=scored[0][0],
        source="quiz",
    )
    await db.quiz_submissions.insert_one(submission.model_dump())

    return {
        "recommended_package": best,
        "shortlisted_homes": shortlist,
        "score": scored[0][0],
        "alternatives": [s[1] for s in scored[1:3]],
        "submission_id": submission.id,
    }


# ----------------------- Quiz Submissions -----------------------
class QuizSubmissionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_city: Optional[str] = None


@router.get("/quiz-submissions", dependencies=[Depends(require_admin)])
async def list_quiz_submissions(status: Optional[str] = None):
    q = {}
    if status:
        q["status"] = status
    docs = await db.quiz_submissions.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@router.get("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def get_quiz_submission(id: str):
    doc = await db.quiz_submissions.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@router.put("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def update_quiz_submission(id: str, body: QuizSubmissionUpdate):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = now_iso()
    result = await db.quiz_submissions.update_one({"id": id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


@router.delete("/quiz-submissions/{id}", dependencies=[Depends(require_admin)])
async def del_quiz_submission(id: str):
    return await delete_doc("quiz_submissions", id)


# ----------------------- Real-time notifications -----------------------
@router.get("/notifications/pending", dependencies=[Depends(require_admin)])
async def notifications_pending(since: Optional[str] = None):
    """Return leads + quiz submissions created after `since` (ISO timestamp).
    If `since` is omitted, returns items from the last 24 hours (capped 20 each)."""
    from datetime import timedelta
    if since:
        try:
            # Accept both trailing Z and +00:00
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except Exception:
            since_dt = datetime.now(timezone.utc) - timedelta(hours=24)
    else:
        since_dt = datetime.now(timezone.utc) - timedelta(hours=24)
    since_iso = since_dt.isoformat()

    leads = await db.leads.find(
        {"created_at": {"$gt": since_iso}}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    quizzes = await db.quiz_submissions.find(
        {"created_at": {"$gt": since_iso}}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)

    items = []
    for l in leads:
        subtitle_parts = [l.get("phone", "")]
        if l.get("interested_home"):
            subtitle_parts.append(f"Home: {l['interested_home']}")
        if l.get("interested_package"):
            subtitle_parts.append(f"Package: {l['interested_package']}")
        items.append({
            "type": "lead",
            "id": l.get("id"),
            "title": f"New lead — {l.get('name','Unknown')}",
            "subtitle": " · ".join([p for p in subtitle_parts if p]),
            "created_at": l.get("created_at"),
            "source": l.get("source"),
            "link": "/admin/leads",
        })
    for q in quizzes:
        contact = q.get("contact_name") or "Anonymous"
        pkg = q.get("recommended_package_name") or "—"
        items.append({
            "type": "quiz",
            "id": q.get("id"),
            "title": f"Quiz submission — {contact}",
            "subtitle": f"Recommended: {pkg}",
            "created_at": q.get("created_at"),
            "link": "/admin/quiz-submissions",
        })

    # Sort combined desc by created_at
    items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return {
        "items": items,
        "now": datetime.now(timezone.utc).isoformat(),
        "leads_count": len(leads),
        "quiz_count": len(quizzes),
    }


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
    # Link the quiz submission if provided
    if body.quiz_submission_id:
        await db.quiz_submissions.update_one(
            {"id": body.quiz_submission_id},
            {"$set": {
                "converted_to_lead_id": lead.id,
                "contact_name": body.name,
                "contact_phone": body.phone,
                "contact_email": body.email,
                "contact_city": body.city,
                "status": "converted",
                "updated_at": now_iso(),
            }},
        )
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


# ============================================================================
# Client Proposals — CRUD + PDF generation + auto reference number
# ============================================================================

async def _generate_ref_number() -> str:
    """Generate a sequential proposal reference like CON-2026-0001."""
    year = datetime.now(timezone.utc).year
    prefix = f"CON-{year}-"
    # Count existing proposals for this year to get next sequence
    latest = await db.proposals.find(
        {"ref_number": {"$regex": f"^{prefix}"}}, {"ref_number": 1}
    ).sort("ref_number", -1).limit(1).to_list(1)
    seq = 1
    if latest:
        try:
            seq = int(latest[0]["ref_number"].split("-")[-1]) + 1
        except Exception:
            seq = 1
    return f"{prefix}{seq:04d}"


async def _hydrate_from_package(proposal_data: dict) -> dict:
    """Fill scope/exclusions/payment_schedule/package meta from the linked package
    if the admin left those fields empty."""
    pkg = await db.packages.find_one({"slug": proposal_data.get("package_slug")}, {"_id": 0})
    if not pkg:
        return proposal_data
    # Use "or" so we override None (Pydantic default) as well as missing keys.
    if not proposal_data.get("package_name"):
        proposal_data["package_name"] = pkg.get("name")
    if not proposal_data.get("package_price_per_sqft"):
        proposal_data["package_price_per_sqft"] = pkg.get("price_per_sqft")
    if not proposal_data.get("package_timeline"):
        proposal_data["package_timeline"] = pkg.get("timeline_months")
    if not proposal_data.get("package_warranty_years"):
        proposal_data["package_warranty_years"] = pkg.get("warranty_years")
    if not proposal_data.get("scope_of_work"):
        proposal_data["scope_of_work"] = pkg.get("scope_of_work", []) or []
    if not proposal_data.get("exclusions"):
        proposal_data["exclusions"] = pkg.get("exclusions", []) or []
    if not proposal_data.get("payment_schedule"):
        proposal_data["payment_schedule"] = pkg.get("payment_schedule", []) or []
    return proposal_data


@router.get("/proposals", dependencies=[Depends(require_admin)])
async def list_proposals(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    cursor = db.proposals.find(q, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def get_proposal(proposal_id: str):
    doc = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return doc


@router.post("/proposals", dependencies=[Depends(require_admin)])
async def create_proposal(body: Proposal):
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["ref_number"] = data.get("ref_number") or (await _generate_ref_number())
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    data = await _hydrate_from_package(data)
    await db.proposals.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def update_proposal(proposal_id: str, body: Proposal):
    data = body.model_dump()
    data["id"] = proposal_id
    data["updated_at"] = now_iso()
    data = await _hydrate_from_package(data)
    await db.proposals.update_one({"id": proposal_id}, {"$set": data}, upsert=True)
    doc = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    return doc


@router.delete("/proposals/{proposal_id}", dependencies=[Depends(require_admin)])
async def delete_proposal(proposal_id: str):
    res = await db.proposals.delete_one({"id": proposal_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"success": True}


@router.get("/proposals/{proposal_id}/pdf", dependencies=[Depends(require_admin)])
async def download_proposal_pdf(proposal_id: str):
    prop = await db.proposals.find_one({"id": proposal_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # Load package for specs used inside the PDF
    pkg = await db.packages.find_one({"slug": prop.get("package_slug")}, {"_id": 0}) or {}
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from proposal_pdf import generate_proposal_pdf
    pdf_bytes = generate_proposal_pdf(prop, pkg, settings)
    filename = f"{(prop.get('ref_number') or 'proposal').replace('/', '_')}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


# ============================================================================
# Custom Quotes — bespoke quotation builder with AI + full-editable PDF
# ============================================================================

async def _generate_cq_ref_number() -> str:
    """Generate a sequential custom-quote reference like CQ-2026-0001."""
    year = datetime.now(timezone.utc).year
    prefix = f"CQ-{year}-"
    latest = await db.custom_quotes.find(
        {"ref_number": {"$regex": f"^{prefix}"}}, {"ref_number": 1}
    ).sort("ref_number", -1).limit(1).to_list(1)
    seq = 1
    if latest:
        try:
            seq = int(latest[0]["ref_number"].split("-")[-1]) + 1
        except Exception:
            seq = 1
    return f"{prefix}{seq:04d}"


@router.get("/custom-quotes", dependencies=[Depends(require_admin)])
async def list_custom_quotes(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    cursor = db.custom_quotes.find(q, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def get_custom_quote(quote_id: str):
    doc = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    return doc


@router.post("/custom-quotes", dependencies=[Depends(require_admin)])
async def create_custom_quote(body: CustomQuote):
    from models import DEFAULT_MATERIAL_SPECS
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["ref_number"] = data.get("ref_number") or (await _generate_cq_ref_number())
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    # Seed the standard Material Specification sheet on new quotes so admins
    # can just tweak instead of typing 19 rows from scratch.
    if not data.get("material_specs"):
        data["material_specs"] = [dict(r) for r in DEFAULT_MATERIAL_SPECS]
    await db.custom_quotes.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def update_custom_quote(quote_id: str, body: CustomQuote):
    data = body.model_dump()
    data["id"] = quote_id
    data["updated_at"] = now_iso()
    # Ensure ref_number is preserved if the payload omitted it
    if not data.get("ref_number"):
        existing = await db.custom_quotes.find_one({"id": quote_id}, {"ref_number": 1})
        if existing and existing.get("ref_number"):
            data["ref_number"] = existing["ref_number"]
        else:
            data["ref_number"] = await _generate_cq_ref_number()
    await db.custom_quotes.update_one({"id": quote_id}, {"$set": data}, upsert=True)
    doc = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    return doc


@router.delete("/custom-quotes/{quote_id}", dependencies=[Depends(require_admin)])
async def delete_custom_quote(quote_id: str):
    res = await db.custom_quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    return {"success": True}


class CustomQuoteAISuggestBody(BaseModel):
    mode: str = "recommend"  # 'recommend' | 'scratch'
    built_up_area: Optional[float] = None
    plot_area: Optional[float] = None
    floors: Optional[str] = None
    bhk: Optional[str] = None
    budget: Optional[float] = None
    style_pref: Optional[str] = None
    package_slug: Optional[str] = None
    client_name: Optional[str] = None


async def _run_ai_suggest_job(job_id: str, payload: dict):
    """Background worker — runs the LLM call and writes result to db.ai_jobs."""
    from ai_service import suggest_custom_quote
    try:
        result = await suggest_custom_quote(payload)
        if not result:
            await db.ai_jobs.update_one(
                {"id": job_id},
                {"$set": {
                    "status": "error",
                    "error": "AI service returned an empty response. Please try again.",
                    "updated_at": now_iso(),
                }},
            )
            return
        await db.ai_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "done",
                "result": result,
                "updated_at": now_iso(),
            }},
        )
    except Exception as e:
        await db.ai_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "error",
                "error": str(e)[:500],
                "updated_at": now_iso(),
            }},
        )


@router.post("/custom-quotes/ai-suggest", dependencies=[Depends(require_admin)])
async def custom_quote_ai_suggest(body: CustomQuoteAISuggestBody):
    """Kick off an AI suggestion job. Returns {job_id} immediately.

    Client should poll GET /custom-quotes/ai-suggest/{job_id} every 2s until
    status is 'done' or 'error'. Sync call is impossible here because GPT-5
    with a structured output frequently takes 60-120s which exceeds ingress
    timeouts on many hosting platforms.
    """
    import asyncio
    base_pkg = None
    if body.package_slug:
        base_pkg = await db.packages.find_one({"slug": body.package_slug}, {"_id": 0})

    payload = body.model_dump()
    payload["base_package"] = base_pkg or None

    job_id = new_id()
    await db.ai_jobs.insert_one({
        "id": job_id,
        "kind": "custom_quote_suggest",
        "status": "pending",
        "result": None,
        "error": None,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    })
    # Fire-and-forget the background task
    asyncio.create_task(_run_ai_suggest_job(job_id, payload))
    return {"job_id": job_id, "status": "pending"}


@router.get("/custom-quotes/ai-suggest/{job_id}", dependencies=[Depends(require_admin)])
async def custom_quote_ai_suggest_status(job_id: str):
    job = await db.ai_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/custom-quotes/{quote_id}/pdf", dependencies=[Depends(require_admin)])
async def download_custom_quote_pdf(quote_id: str):
    quote = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}

    from custom_quote_pdf import generate_custom_quote_pdf
    try:
        pdf_bytes = generate_custom_quote_pdf(quote, settings)
    except Exception as e:
        import traceback, logging as _l
        _l.getLogger(__name__).exception("[pdf] custom-quote download failed for %s", quote_id)
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {type(e).__name__}: {str(e)[:200]}",
        )
    filename = f"{(quote.get('ref_number') or 'quote').replace('/', '_')}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.post("/custom-quotes/preview", dependencies=[Depends(require_admin)])
async def preview_custom_quote_pdf(body: CustomQuote):
    """Render a PDF from an unsaved quote payload for the live editor preview.

    Accepts a full CustomQuote body (may be missing an id) and returns the
    PDF bytes inline so the frontend can drop the URL into an iframe.
    """
    quote = body.model_dump()
    quote["ref_number"] = quote.get("ref_number") or "PREVIEW"
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}
    from custom_quote_pdf import generate_custom_quote_pdf
    try:
        pdf_bytes = generate_custom_quote_pdf(quote, settings)
    except Exception as e:
        import logging as _l
        _l.getLogger(__name__).exception("[pdf] custom-quote preview failed")
        raise HTTPException(
            status_code=500,
            detail=f"PDF preview failed: {type(e).__name__}: {str(e)[:200]}",
        )
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'inline; filename="preview.pdf"',
            "Cache-Control": "no-store",
        },
    )


# ============================================================================
# Interior Library — reusable interior catalog items
# ============================================================================

@router.get("/interior-library", dependencies=[Depends(require_admin)])
async def list_interior_library(category: Optional[str] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.interior_library.find(query, {"_id": 0}).sort("category", 1).limit(500).to_list(500)
    return docs


@router.get("/interior-library/categories", dependencies=[Depends(require_admin)])
async def list_interior_library_categories():
    cats = await db.interior_library.distinct("category")
    return sorted(cats)


@router.post("/interior-library", dependencies=[Depends(require_admin)])
async def create_interior_library_item(body: InteriorLibraryItem):
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.interior_library.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/interior-library/{item_id}", dependencies=[Depends(require_admin)])
async def update_interior_library_item(item_id: str, body: InteriorLibraryItem):
    data = body.model_dump()
    data["id"] = item_id
    data["updated_at"] = now_iso()
    await db.interior_library.update_one({"id": item_id}, {"$set": data}, upsert=True)
    return await db.interior_library.find_one({"id": item_id}, {"_id": 0})


@router.delete("/interior-library/{item_id}", dependencies=[Depends(require_admin)])
async def delete_interior_library_item(item_id: str):
    res = await db.interior_library.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}


# ============================================================================
# Quote Templates — reusable quote baselines
# ============================================================================

_TEMPLATE_COPY_FIELDS = [
    "price_per_sqft", "spec_categories", "addons", "line_items",
    "scope_of_work", "exclusions", "payment_schedule", "terms",
    "intro_note", "gst_percent", "warranty_years",
]


@router.get("/quote-templates", dependencies=[Depends(require_admin)])
async def list_quote_templates():
    cursor = db.quote_templates.find({}, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@router.get("/quote-templates/{template_id}", dependencies=[Depends(require_admin)])
async def get_quote_template(template_id: str):
    doc = await db.quote_templates.find_one({"id": template_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")
    return doc


@router.post("/quote-templates", dependencies=[Depends(require_admin)])
async def create_quote_template(body: QuoteTemplate):
    data = body.model_dump()
    data["id"] = data.get("id") or new_id()
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.quote_templates.insert_one(data)
    data.pop("_id", None)
    return data


@router.put("/quote-templates/{template_id}", dependencies=[Depends(require_admin)])
async def update_quote_template(template_id: str, body: QuoteTemplate):
    data = body.model_dump()
    data["id"] = template_id
    data["updated_at"] = now_iso()
    await db.quote_templates.update_one({"id": template_id}, {"$set": data}, upsert=True)
    return await db.quote_templates.find_one({"id": template_id}, {"_id": 0})


@router.delete("/quote-templates/{template_id}", dependencies=[Depends(require_admin)])
async def delete_quote_template(template_id: str):
    res = await db.quote_templates.delete_one({"id": template_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"success": True}


class SaveAsTemplateBody(BaseModel):
    name: str
    description: str = ""
    tags: List[str] = []


@router.post("/custom-quotes/{quote_id}/save-as-template", dependencies=[Depends(require_admin)])
async def save_quote_as_template(quote_id: str, body: SaveAsTemplateBody):
    quote = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    tpl = {
        "id": new_id(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "sort_order": 0,
        "is_published": True,
        "name": body.name.strip() or f"Template from {quote.get('ref_number')}",
        "description": body.description,
        "tags": body.tags or [],
    }
    for f in _TEMPLATE_COPY_FIELDS:
        tpl[f] = quote.get(f)
    # Clean None -> default
    if tpl.get("warranty_years") is None:
        tpl["warranty_years"] = 10
    if tpl.get("gst_percent") is None:
        tpl["gst_percent"] = 18
    if tpl.get("price_per_sqft") is None:
        tpl["price_per_sqft"] = 0
    await db.quote_templates.insert_one(tpl)
    tpl.pop("_id", None)
    return tpl


class FromTemplateBody(BaseModel):
    template_id: str
    client_name: str = ""
    client_phone: str = ""
    client_email: Optional[str] = None
    built_up_area: Optional[float] = None
    floors: Optional[str] = None


@router.post("/custom-quotes/from-template", dependencies=[Depends(require_admin)])
async def create_quote_from_template(body: FromTemplateBody):
    tpl = await db.quote_templates.find_one({"id": body.template_id}, {"_id": 0})
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    ref = await _generate_cq_ref_number()
    quote = {
        "id": new_id(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "sort_order": 0,
        "is_published": True,
        "ref_number": ref,
        "status": "draft",
        "valid_days": 30,
        "client_name": body.client_name or "New Client",
        "client_phone": body.client_phone or "",
        "client_email": body.client_email,
        "built_up_area": body.built_up_area or 1200,
        "floors": body.floors or "G+1",
        "bhk": "3 BHK",
        "style_pref": "Modern",
        "package_slug": None,
        "package_name": None,
        "discount_label": None,
        "discount_amount": 0,
        "addons": tpl.get("addons") or [],
        "line_items": tpl.get("line_items") or [],
        "spec_categories": tpl.get("spec_categories") or [],
        "scope_of_work": tpl.get("scope_of_work") or [],
        "exclusions": tpl.get("exclusions") or [],
        "payment_schedule": tpl.get("payment_schedule") or [],
        "price_per_sqft": tpl.get("price_per_sqft") or 0,
        "gst_percent": tpl.get("gst_percent") if tpl.get("gst_percent") is not None else 18,
        "warranty_years": tpl.get("warranty_years") or 10,
        "terms": tpl.get("terms"),
        "intro_note": tpl.get("intro_note"),
        "comments": [],
    }
    await db.custom_quotes.insert_one(quote)
    quote.pop("_id", None)
    return quote


# ============================================================================
# Client Portal — public quote view + comments + accept/reject
# ============================================================================

def _sanitize_quote_for_public(q: dict) -> dict:
    """Strip fields the client shouldn't see (internal notes, ai debug etc)."""
    hidden = {"_id", "prepared_by", "ai_notes", "ai_mode", "quiz_submission_id", "lead_id"}
    return {k: v for k, v in q.items() if k not in hidden}


async def _ensure_public_token(quote_id: str) -> str:
    """Generate a public_token for a quote if it doesn't have one yet."""
    import secrets
    token = secrets.token_urlsafe(24)
    await db.custom_quotes.update_one(
        {"id": quote_id, "$or": [{"public_token": {"$exists": False}}, {"public_token": None}, {"public_token": ""}]},
        {"$set": {"public_token": token, "updated_at": now_iso()}},
    )
    doc = await db.custom_quotes.find_one({"id": quote_id}, {"public_token": 1})
    return (doc or {}).get("public_token") or token


@router.post("/custom-quotes/{quote_id}/public-link", dependencies=[Depends(require_admin)])
async def get_or_create_public_link(quote_id: str):
    quote = await db.custom_quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Custom quote not found")
    token = quote.get("public_token") or (await _ensure_public_token(quote_id))
    return {"public_token": token, "public_url": f"/quote/{token}"}


@router.get("/public/quote/{token}")
async def public_get_quote(token: str):
    q = await db.custom_quotes.find_one({"public_token": token}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Quote not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}
    return {"quote": _sanitize_quote_for_public(q), "settings": settings}


@router.get("/public/quote/{token}/pdf")
async def public_quote_pdf(token: str):
    quote = await db.custom_quotes.find_one({"public_token": token}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0}) or {}
    from custom_quote_pdf import generate_custom_quote_pdf
    pdf_bytes = generate_custom_quote_pdf(quote, settings)
    filename = f"{(quote.get('ref_number') or 'quote').replace('/', '_')}.pdf"
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


class PublicCommentBody(BaseModel):
    author: Optional[str] = None
    message: str


@router.post("/public/quote/{token}/comment")
async def public_post_comment(token: str, body: PublicCommentBody):
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")
    if len(body.message) > 2000:
        raise HTTPException(status_code=400, detail="Message too long")
    q = await db.custom_quotes.find_one({"public_token": token}, {"id": 1, "client_name": 1})
    if not q:
        raise HTTPException(status_code=404, detail="Quote not found")
    comment = {
        "id": new_id(),
        "author": (body.author or q.get("client_name") or "Client").strip()[:80],
        "message": body.message.strip()[:2000],
        "source": "client",
        "created_at": now_iso(),
    }
    await db.custom_quotes.update_one(
        {"id": q["id"]},
        {"$push": {"comments": comment}, "$set": {"updated_at": now_iso()}},
    )
    return {"success": True, "comment": comment}


class PublicActionBody(BaseModel):
    action: str  # 'accepted' | 'rejected'
    author: Optional[str] = None
    note: Optional[str] = None


@router.post("/public/quote/{token}/action")
async def public_post_action(token: str, body: PublicActionBody):
    action = (body.action or "").strip().lower()
    if action not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid action")
    q = await db.custom_quotes.find_one({"public_token": token}, {"id": 1, "client_name": 1})
    if not q:
        raise HTTPException(status_code=404, detail="Quote not found")

    updates = {
        "client_action": action,
        "client_action_at": now_iso(),
        "status": "accepted" if action == "accepted" else "rejected",
        "updated_at": now_iso(),
    }
    push = None
    if body.note and body.note.strip():
        push = {
            "id": new_id(),
            "author": (body.author or q.get("client_name") or "Client").strip()[:80],
            "message": f"[{action.upper()}] {body.note.strip()[:1500]}",
            "source": "client",
            "created_at": now_iso(),
        }
    op = {"$set": updates}
    if push:
        op["$push"] = {"comments": push}
    await db.custom_quotes.update_one({"id": q["id"]}, op)
    return {"success": True, "action": action}


# ============================================================================
# CSV Exports — Leads + Quiz Submissions
# ============================================================================

def _csv_response(rows: List[List[Any]], filename: str) -> FastAPIResponse:
    import csv
    import io
    buf = io.StringIO()
    writer = csv.writer(buf, quoting=csv.QUOTE_MINIMAL)
    for r in rows:
        writer.writerow(["" if v is None else str(v) for v in r])
    return FastAPIResponse(
        content=buf.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.get("/exports/leads.csv", dependencies=[Depends(require_admin)])
async def export_leads_csv(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    docs = await db.leads.find(q, {"_id": 0}).sort("created_at", -1).limit(10000).to_list(10000)
    rows = [[
        "Created At", "Name", "Phone", "Email", "City",
        "Interested Home", "Interested Package", "Message",
        "Source", "Status", "Quote Ref",
    ]]
    for d in docs:
        rows.append([
            d.get("created_at"), d.get("name"), d.get("phone"), d.get("email"),
            d.get("city"), d.get("interested_home"), d.get("interested_package"),
            (d.get("message") or "").replace("\n", " "),
            d.get("source"), d.get("status"), d.get("quote_ref"),
        ])
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
    return _csv_response(rows, f"constructons-leads-{ts}.csv")


@router.get("/exports/quiz-submissions.csv", dependencies=[Depends(require_admin)])
async def export_quiz_csv(status: Optional[str] = None):
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    docs = await db.quiz_submissions.find(q, {"_id": 0}).sort("created_at", -1).limit(10000).to_list(10000)
    rows = [[
        "Created At", "Contact Name", "Phone", "Email", "City",
        "Budget", "Family Size", "Style", "Smart Home",
        "Recommended Package", "Score", "Shortlisted Homes",
        "Status", "Source", "Notes",
    ]]
    for d in docs:
        rows.append([
            d.get("created_at"), d.get("contact_name"), d.get("contact_phone"),
            d.get("contact_email"), d.get("contact_city"),
            d.get("budget"), d.get("family_size"), d.get("style"), d.get("smart_home"),
            d.get("recommended_package_name") or d.get("recommended_package_slug"),
            d.get("score"),
            ", ".join(d.get("shortlisted_home_names") or []),
            d.get("status"), d.get("source"),
            (d.get("notes") or "").replace("\n", " "),
        ])
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
    return _csv_response(rows, f"constructons-quiz-submissions-{ts}.csv")


# ============================================================================
# Customer Auth — Google OAuth via Emergent Auth
# ============================================================================
from customer_auth import (
    ProcessSessionBody, process_google_session, get_current_customer,
    logout_customer as _logout_customer,
)


@router.post("/customer/auth/session")
async def customer_process_session(body: ProcessSessionBody, response: FastAPIResponse):
    return await process_google_session(body, response)


@router.get("/customer/me")
async def customer_me(customer=Depends(get_current_customer)):
    return {
        "user_id": customer.get("user_id"),
        "email": customer.get("email"),
        "name": customer.get("name"),
        "picture": customer.get("picture"),
    }


@router.post("/customer/logout")
async def customer_logout(request: Request, response: FastAPIResponse):
    return await _logout_customer(request, response)


# ============================================================================
# AI Image Generation — Gemini Nano Banana + Object Storage
# ============================================================================

class AiImageBody(BaseModel):
    prompt: str
    category: str = "quote-visuals"


@router.post("/ai/generate-image", dependencies=[Depends(require_admin)])
async def ai_generate_image(body: AiImageBody):
    """Generate an image with Gemini Nano Banana and store it in Object Storage.

    Returns the same shape as /media/upload so the frontend can use identical
    handling for uploaded and AI-generated images.
    """
    from ai_service import generate_image_nanobanana
    from media_service import put_object, build_storage_path

    prompt = (body.prompt or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    if len(prompt) > 1000:
        raise HTTPException(status_code=400, detail="Prompt too long")

    img_bytes = await generate_image_nanobanana(prompt)
    if not img_bytes:
        raise HTTPException(status_code=502, detail="Image generation failed. Try a different prompt.")

    ct = "image/png"
    path = build_storage_path(body.category or "quote-visuals", "ai-gen.png", ct)
    try:
        put_object(path, img_bytes, ct)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")

    record = {
        "id": new_id(),
        "storage_path": path,
        "original_filename": "ai-generated.png",
        "content_type": ct,
        "size": len(img_bytes),
        "category": body.category or "quote-visuals",
        "is_deleted": False,
        "created_at": now_iso(),
        "ai_prompt": prompt[:800],
    }
    await db.media_uploads.insert_one(record)
    return {
        "id": record["id"],
        "storage_path": path,
        "url": f"/api/media/{path}",
        "content_type": ct,
        "size": len(img_bytes),
        "ai_prompt": prompt[:800],
    }


# ============================================================================
# Media (Image Upload Studio) — Emergent Object Storage
# ============================================================================

@router.post("/media/upload", dependencies=[Depends(require_admin)])
async def upload_media(file: UploadFile = File(...), category: str = Form("general")):
    """Upload a single image to Emergent Object Storage.

    Returns { "url": "/api/media/<path>", "storage_path": "<path>", ... } so
    the frontend can immediately preview / paste the URL into a package field.
    """
    from media_service import (
        put_object, build_storage_path,
        ALLOWED_MIME_PREFIXES, MAX_UPLOAD_BYTES,
    )

    ct = (file.content_type or "").lower()
    if not any(ct.startswith(p) for p in ALLOWED_MIME_PREFIXES):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ct}")

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"File exceeds {mb} MB limit")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    path = build_storage_path(category, file.filename or "image", ct)
    try:
        result = put_object(path, data, ct)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")

    stored_path = result.get("path") or path
    record = {
        "id": new_id(),
        "storage_path": stored_path,
        "original_filename": file.filename,
        "content_type": ct,
        "size": len(data),
        "category": category,
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.media_uploads.insert_one(record)
    return {
        "id": record["id"],
        "storage_path": stored_path,
        "url": f"/api/media/{stored_path}",
        "size": len(data),
        "content_type": ct,
        "original_filename": file.filename,
    }


@router.get("/media/{path:path}")
async def download_media(path: str):
    """Public read of any image uploaded through /media/upload."""
    from media_service import get_object

    record = await db.media_uploads.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    content: bytes = b""
    fetched_content_type: str = "application/octet-stream"
    try:
        content, fetched_content_type = get_object(path)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Storage read failed: {e}")

    return FastAPIResponse(
        content=content,
        media_type=record.get("content_type") or fetched_content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.delete("/media/{media_id}", dependencies=[Depends(require_admin)])
async def delete_media(media_id: str):
    res = await db.media_uploads.update_one(
        {"id": media_id},
        {"$set": {"is_deleted": True, "deleted_at": now_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}


@router.get("/media", dependencies=[Depends(require_admin)])
async def list_media(category: Optional[str] = None, limit: int = 50):
    q: Dict[str, Any] = {"is_deleted": False}
    if category:
        q["category"] = category
    cursor = db.media_uploads.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    for it in items:
        it["url"] = f"/api/media/{it['storage_path']}"
    return items


# ============================================================================
# Package Version History
# ============================================================================
# Snapshots are stored in `package_versions`. We keep the newest 20 snapshots
# per package (older ones auto-pruned) so admins can roll back in one click.
# Snapshots are captured on every PUT /api/packages/{id} and on DELETE.

MAX_VERSIONS_PER_PACKAGE = 20


async def _snapshot_package(package_id: str, note: str = "edit"):
    current = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not current:
        return
    snap = {
        "id": new_id(),
        "package_id": package_id,
        "package_slug": current.get("slug"),
        "note": note,
        "snapshot_at": now_iso(),
        "data": current,
    }
    await db.package_versions.insert_one(snap)
    # Prune older snapshots keeping the newest MAX_VERSIONS_PER_PACKAGE
    older_ids_cursor = (
        db.package_versions.find({"package_id": package_id}, {"_id": 1})
        .sort("snapshot_at", -1)
        .skip(MAX_VERSIONS_PER_PACKAGE)
    )
    old_ids = [d["_id"] async for d in older_ids_cursor]
    if old_ids:
        await db.package_versions.delete_many({"_id": {"$in": old_ids}})


@router.get("/packages/{package_id}/versions", dependencies=[Depends(require_admin)])
async def list_package_versions(package_id: str):
    cursor = (
        db.package_versions.find({"package_id": package_id}, {"_id": 0, "data": 0})
        .sort("snapshot_at", -1)
        .limit(MAX_VERSIONS_PER_PACKAGE)
    )
    return await cursor.to_list(MAX_VERSIONS_PER_PACKAGE)


@router.get("/packages/{package_id}/versions/{version_id}", dependencies=[Depends(require_admin)])
async def get_package_version(package_id: str, version_id: str):
    snap = await db.package_versions.find_one(
        {"id": version_id, "package_id": package_id}, {"_id": 0}
    )
    if not snap:
        raise HTTPException(status_code=404, detail="Version not found")
    return snap


@router.post("/packages/{package_id}/versions/{version_id}/restore", dependencies=[Depends(require_admin)])
async def restore_package_version(package_id: str, version_id: str):
    snap = await db.package_versions.find_one(
        {"id": version_id, "package_id": package_id}, {"_id": 0}
    )
    if not snap:
        raise HTTPException(status_code=404, detail="Version not found")
    data = snap.get("data") or {}
    # Snapshot current state as a safety net BEFORE restoring
    await _snapshot_package(package_id, note=f"pre-restore from {version_id[:8]}")

    data["updated_at"] = now_iso()
    data.pop("_id", None)
    await db.packages.update_one({"id": package_id}, {"$set": data})
    return {"success": True, "restored_from": version_id}


# ============================================================================
# AI Copy Assist — GPT-5 rewrite suggestions
# ============================================================================

class RewriteRequest(BaseModel):
    text: str
    purpose: Optional[str] = "copy"  # 'tagline' | 'description' | 'faq' | 'copy'
    tone: Optional[str] = "on-brand"


@router.post("/ai/rewrite", dependencies=[Depends(require_admin)])
async def ai_rewrite(body: RewriteRequest):
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    if len(body.text) > 4000:
        raise HTTPException(status_code=413, detail="Text too long (max 4000 chars)")
    from ai_service import rewrite_copy
    suggestions = await rewrite_copy(body.text, body.purpose or "copy", body.tone or "on-brand")
    if not suggestions:
        raise HTTPException(status_code=502, detail="AI could not generate suggestions right now. Please try again.")
    return {"suggestions": suggestions}
