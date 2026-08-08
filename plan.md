# plan.md — ConstructONS Premium CMS-Driven Website (Updated)

## 1) Objectives
- Ship a premium, Apple/Tesla/Stripe/Linear/OpenAI/Airbnb-feel marketing website for **ConstructONS** with pixel-perfect UI, luxury spacing, **Poppins** typography, and **Framer Motion** micro-interactions.
- Maintain a **fully CMS-driven architecture**: all public pages/sections + detail pages consume **FastAPI + MongoDB** APIs (no hardcoded content).
- Provide a **production-grade Admin Panel** (cookie-based auth) for CRUD on all content types and advanced sales workflows.
- Deliver **lead capture** (Get Free Consultation / Contact) persisted to MongoDB with admin visibility and lead status workflow.
- Provide a **sales enablement ecosystem**:
  - Standardized build packages with deep material specs
  - Package comparison
  - Brochure/proposal PDFs
  - **Custom Quotes**: generate tailored quotations per client requirements, with AI-assisted recommendations and fully editable spec/pricing.
- Keep data safe and editable without code changes: **Homes, Packages, FAQs, Leads, Quiz Submissions, Proposals, Custom Quotes, Site Settings**.

**Current status:** Phase 2 is complete and stable. Multiple advanced features have been delivered beyond the original MVP (deep package editor, AI copy assist, PDF systems, secure cookie auth). Phase 3 is in progress with a new major admin feature: **Custom Quotes**.

---

## 2) Implementation Steps

### Phase 1 — Core CMS Data Flow ✅ COMPLETED
**Goal:** Prove end-to-end dynamic rendering for the most business-critical flow.

User stories ✅
1. Visitor loads homepage and sees hero + home cards from DB.
2. Visitor opens a Home Collection detail page and sees full specs + gallery.
3. Visitor submits “Get Free Consultation” and lead is saved.
4. Admin logs in and edits home price/specs; site reflects updates.
5. Admin updates home gallery; detail page updates.

Backend ✅
- MongoDB connection + serialization utilities.
- Core schemas + endpoints for `homes`, `hero_sections`, `site_settings`, `media`, `leads`.
- Seed pipeline established.

Frontend ✅
- Tailwind theme tokens (brand orange/navy, premium shadows/radii) + Poppins.
- API client established.
- Homepage wired to API + lead modal.
- Animation primitives via Framer Motion.

Checkpoint ✅
- Verified end-to-end: seed → API → render → lead saved → admin edit reflects.

---

### Phase 2 — V1 Website + Admin Panel ✅ COMPLETED
**Goal:** Implement all required sections CMS-driven + admin CRUD.

User stories ✅
1. Visitor browses Build Packages and explores rich specs.
2. Visitor explores Marketplace + Financial Services.
3. Visitor reads FAQs + Blogs from CMS.
4. Admin manages packages/pricing/specs and updates reflect on site.
5. Admin manages all key marketing content without code changes.

Backend ✅
- Implemented CRUD APIs for **15+ CMS content types**.
- Aggregate endpoint `GET /api/bootstrap`.
- Auto-seeding on startup.
- Leads workflow.

Frontend (Public) ✅
- Premium homepage sections + detailed Home pages.
- Packages route + package detail.
- Lead modal wired to `/api/leads`.

Frontend (Admin) ✅
- Admin login + dashboard.
- Leads inbox.
- Generic CRUD drawer editor.

Testing ✅
- End-to-end verified via `testing_agent_v3` (high pass rate) + iterative fixes.

---

### Phase 2.5 — Major Enhancements & Production Hardening ✅ COMPLETED
**Goal:** Upgrade from MVP to a premium construction operating system feel.

Delivered ✅
- **Auth security**: migrated from localStorage JWT to **httpOnly secure cookies**, admin credentials stored in MongoDB with **bcrypt**.
- **Deep Package Editor**: full control over spec categories, scope, exclusions, addons, headings.
- **AI Copy Assist** (GPT-5 via Emergent LLM): rewrite taglines/descriptions safely.
- **Image Upload Studio**: Emergent Object Storage integration.
- **PDF Systems**:
  - Public package brochure generator
  - Personalized client proposal generator (7-page) with WhatsApp sharing
- **Realtime admin notifications** integrated.
- Security: DOMPurify added to reduce XSS risk.

Bug fixes ✅
- **Packages Comparison page blank** fixed and visually verified (table renders with full spec matrix).

---

### Phase 3 — Sales Workflows: Custom Quotes (NEW) 🚧 IN PROGRESS
**Goal:** Add a new Admin section **Custom Quotes** that lets ConstructONS generate tailored quotations per client requirements, with AI-assisted suggestions, full editability, and share-ready PDF.

#### User stories (Phase 3)
1. Admin creates a Custom Quote with client details + requirements (plot size, floors, built-up area, budget, timeline, style).
2. Admin chooses AI mode:
   - **Mode A:** Recommend best-fit base package + specific upgrades/downgrades to meet budget.
   - **Mode B:** Generate a full custom spec sheet from scratch.
   - **Mode C (selected):** Admin can choose A or B per quote.
3. Admin receives an AI-generated draft including:
   - Suggested base package + rationale
   - Spec deltas vs selected base package
   - Suggested addons
   - Pricing breakdown + assumptions
4. Admin can edit **everything** before finalizing:
   - Client info, requirements, base package
   - Deep spec categories and every spec row
   - Addons, custom line items
   - Pricing breakdown (base, addons, discounts, GST, grand total)
   - Terms/notes, exclusions, payment schedule, timeline
5. Admin downloads a branded PDF with client name/details.
6. Admin shares via:
   - WhatsApp message with link/attachment workflow (existing pattern)
   - Email (mailto link + attachment download)

#### Backend (Phase 3)
- **models.py**
  - Add `CustomQuote` model (snapshot-based, immutable reference number, editable fields).
- **ai_service.py**
  - Add `suggest_custom_quote()`:
    - Inputs: requirements + mode + optionally base package
    - Output: normalized JSON payload compatible with the editor (spec_categories, addons_selected, pricing fields, notes).
- **custom_quote_pdf.py** (NEW)
  - High-end multi-page PDF generator (ReportLab), aligned with proposal_pdf styling.
  - Includes:
    - Cover page (client + ref)
    - Requirements summary
    - Package comparison summary (base vs suggested custom)
    - Detailed specs table by category
    - Addons + pricing table
    - Terms, exclusions, payment schedule
- **routes.py**
  - CRUD: `GET/POST/PUT/DELETE /api/custom-quotes` (admin protected)
  - PDF: `GET /api/custom-quotes/{id}/pdf`
  - AI suggest: `POST /api/custom-quotes/suggest` or `POST /api/ai/custom-quote-suggest`
  - Ensure safe updates (avoid partial PUT wipes; prefer full object saves from UI).
- Optional: attach quote reference back to lead (`leads.quote_ref`).

#### Frontend (Phase 3)
- **api.js**
  - Add `adminApi.customQuotes.*` helpers:
    - list/create/update/delete
    - suggest
    - pdf download URL
- **AdminLayout.js**
  - Add new nav entry: **Custom Quotes**.
- **App.js**
  - Add route: `/admin/custom-quotes`.
- **AdminCustomQuotes.js** (NEW)
  - Premium workflow UI:
    - Left: quote form + deep editable spec editor (reuse PackageEditorHelpers patterns)
    - Right: AI suggestion panel (mode switch A/B) with “Apply to draft” and diff preview
    - Pricing calculator panel (auto totals + manual overrides)
    - Actions: Save draft, Download PDF, WhatsApp share, Email share

#### Testing (Phase 3)
- Add a dedicated test pass:
  - CRUD create/update/delete custom quote
  - AI suggest returns valid JSON payload
  - PDF endpoint returns bytes and correct headers
  - UI renders, edits persist, download/share actions work
- Run `testing_agent_v3` after implementation.

---

### Phase 4 — Polish Pass + Production-Readiness (Next)
**Goal:** Make it feel world-class at production standards (motion, performance, accessibility, reliability) and harden CMS behavior.

Backend
- Stronger validation/constraints (slug uniqueness, required fields).
- Pagination + filters for large lists (blogs/leads/quiz submissions).
- Split `routes.py` into smaller routers (recommended refactor due to 900+ lines).

Frontend
- Public UI polish: skeleton loaders, lazy loading, reduced motion.
- Admin UX hardening: grouped tabs, better validation messaging, confirmations.
- Add richer WYSIWYG editor for Blogs/Pages (P1).

Testing
- Re-run `testing_agent_v3` for regressions.

---

## 3) Next Actions

**Immediate (Phase 3 build) — Custom Quotes**
1. Add backend `CustomQuote` model + Mongo collection.
2. Add CRUD endpoints + PDF endpoint.
3. Add AI suggestion endpoint supporting Mode A and Mode B.
4. Build AdminCustomQuotes page:
   - Requirements intake
   - AI panel + apply
   - Deep editable specs
   - Pricing breakdown
   - Download PDF + WhatsApp + Email
5. Run `testing_agent_v3` and visually verify the admin flow.

**After Custom Quotes**
6. Add Rich Text Editor for blogs/pages (WYSIWYG).
7. Add CSV export for leads and quiz submissions.
8. Add password reset / email flow (optional).

---

## 4) Success Criteria
- Phase 2 (met)
  - 100% CMS-driven pages and sections editable via Admin.
  - Premium UI.
  - Homes + packages fully functional.
  - Leads persist to MongoDB.

- Phase 3 (target)
  - Admin can generate a **custom quote** in <5 minutes:
    - AI-assisted recommendations (Mode A/B)
    - Full editability of specs + pricing
    - PDF export with client name/details
    - WhatsApp + Email sharing workflow
  - No regressions in existing proposals/packages workflows.
  - `testing_agent_v3` passes with no material gaps.
