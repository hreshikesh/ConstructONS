# plan.md — ConstructONS Premium CMS-Driven Website (Updated)

## 1) Objectives
- Ship a premium, Apple/Tesla/Stripe/Linear/OpenAI/Airbnb-feel marketing website for **ConstructONS** with pixel-perfect UI, luxury spacing, **Poppins** typography, and **Framer Motion** micro-interactions.
- Build a **fully CMS-driven architecture**: all public pages/sections + detail pages consume **FastAPI + MongoDB** APIs (no hardcoded content).
- Provide a **simple Admin Panel** (JWT-protected; dev bypass token supported) for CRUD on all content types.
- Deliver **lead capture** (Get Free Consultation / Contact) persisted to MongoDB with admin visibility and lead status workflow.
- Seed the DB with high-quality **sample content + curated Unsplash images** so the site is production-like from day one.

**Current status:** Phase 2 (V1 Website + Admin Panel MVP) is **complete and verified** end-to-end.

---

## 2) Implementation Steps

### Phase 1 — Core CMS Data Flow (No POC needed; build directly) ✅ COMPLETED
**Goal:** Prove end-to-end dynamic rendering for the most business-critical flow.

User stories (Phase 1)
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
- Home page skeleton wired to API + lead modal.
- Animation primitives via Framer Motion.

Checkpoint ✅
- Verified: seed → API → homepage + detail → lead saved → admin edit reflects.

---

### Phase 2 — V1 Website + Admin Panel (MVP complete) ✅ COMPLETED
**Goal:** Implement all required sections CMS-driven + admin CRUD.

User stories (Phase 2)
1. Visitor browses Build Packages and expands to see specs/warranty/timeline/AI features.
2. Visitor explores Marketplace + Financial Services; “Coming Soon” supported.
3. Visitor reads FAQs + Blogs populated from CMS.
4. Admin manages packages/pricing/specs and updates reflect on site.
5. Admin manages all key marketing content without code changes.

Backend ✅
- Implemented CRUD APIs for **15+ CMS content types** with clean schemas:
  - `homes`
  - `packages` (spec sections embedded as structured arrays)
  - `testimonials`
  - `faqs`
  - `blogs`
  - `marketplace_categories`
  - `financial_services`
  - `team_members`
  - `ai_modules`
  - `journey_steps`
  - `hero_sections`
  - `comparison`
  - `stats`
  - `media`
  - `site_settings` (singleton)
  - `leads` (capture + admin list/update/delete)
- Admin auth:
  - JWT login endpoint
  - Dev bypass token for local/testing
  - Admin guards on protected routes
- **Aggregate endpoint**: `GET /api/bootstrap` to power homepage in one call.
- **Auto-seeding** on backend startup if DB is empty.

Seed data ✅
- Populated premium sample dataset:
  - 6 homes, 4 packages, 7 AI modules, 8 marketplace categories, 4 financial services
  - 8 journey steps, 5 testimonials, 3 blogs, 6 FAQs, 4 team members
  - comparison rows + stats + hero + site settings + media

Frontend (Public) ✅
- Premium CMS-driven homepage sections:
  - Sticky Header + CTA
  - Hero w/ floating AI dashboard cards
  - Home Collection carousel/grid
  - Packages pricing cards w/ expand
  - AI Platform modules + dashboard preview
  - Marketplace categories
  - Financial Services
  - Why ConstructONS comparison + stat band
  - Customer Journey animated timeline
  - Testimonials marquee
  - Contact section (call/whatsapp/email/map + CTA)
  - Footer
- Routes implemented:
  - `/homes/:slug` home detail page (gallery, specs, floor plan areas)
  - `/packages`, `/about`, `/blog`, `/blog/:slug`, `/contact`
- Global Lead Modal wired to `/api/leads`.

Frontend (Admin) ✅
- Admin panel:
  - `/admin/login` (JWT stored in localStorage)
  - `/admin` dashboard with counts + recent leads
  - `/admin/leads` inbox with status updates (new/contacted/closed)
  - Generic CRUD: `/admin/:entity` for 15 CMS entities with side-drawer editor
  - `/admin/site-settings` editor

Testing ✅
- End-to-end verified via `testing_agent_v3`:
  - Backend: **100%**
  - Public frontend: **100%**
  - Admin frontend: **95%**
  - Overall: **98%**
- Fixed bug: Lead form optional email now submits empty email as `undefined` to satisfy backend validation.

---

### Phase 3 — Polish Pass + Production Hardening (Next)
**Goal:** Make it feel world-class at production standards (motion, performance, accessibility, reliability) and harden CMS behavior.

User stories (Phase 3)
1. Visitor experiences faster perceived performance (no layout shifts, smooth transitions).
2. Mobile UI remains premium and touch-friendly across all sections.
3. Admin edits feel safe: inline validation errors, clearer field hints, and stronger guardrails.
4. Visitor sees only published content; ordering is consistent.
5. Large collections (blogs/leads/homes) remain fast with pagination + search.

Backend (Phase 3)
- Add stronger validation/constraints:
  - Slug uniqueness (homes/blogs/packages)
  - Required fields enforcement + friendly error messages
- Add CMS publishing controls:
  - `is_published` + `sort_order` consistency across all entities (already present; enforce in queries)
  - Optional `visibility` states (draft/published) if needed
- Add pagination + filters:
  - Blogs: `page`, `page_size`, `tag`, `search`
  - Leads: `status`, `page`, `search`, date range
  - Homes: `style`, `bedrooms`, `budget` (optional)

Frontend (Phase 3)
- UI/UX polish:
  - Add skeleton loaders on key sections
  - Add lazy loading + blur-up for images
  - Add scroll-reveal consistency across all sections
  - Improve hover states, focus rings, reduced motion support
- Admin UX hardening:
  - Better field grouping per entity (tabs/sections)
  - Validation + JSON editor assistance for `json` fields
  - Confirmation modals for destructive actions
- Accessibility:
  - ARIA attributes for modal, navigation, accordions
  - Keyboard navigation checks and focus trapping

Testing (Phase 3)
- Run `testing_agent_v3` again:
  - CRUD regression
  - Mobile responsiveness
  - Broken links/routes
  - Form validation + error handling

---

### Phase 4 — Auth/Permissions + Optional Enhancements (post-approval)
**Goal:** Tighten security + add advanced CMS capabilities.

User stories (Phase 4)
1. Admin roles (owner/editor) and permissions.
2. Image uploads (instead of URL-only), with media library.
3. Drafts + previews + scheduled publishing.
4. Export leads as CSV and basic analytics.
5. Audit log of admin content changes.

Items (optional)
- Replace dev bypass with stricter auth:
  - refresh tokens, expiry handling, secure storage approach
- Role-based permissions + RBAC.
- Media upload support (S3-compatible or local dev storage).
- Content revisions/drafts.
- CSV export for leads.

---

## 3) Next Actions
**Immediate (Phase 3 kickoff)**
1. Add pagination + search on backend list endpoints for blogs/leads/homes.
2. Implement consistent `is_published` enforcement + ordering behavior.
3. Add skeleton loaders + lazy/blur-up images on public site.
4. Improve admin form UX: grouped fields, validations, JSON assistance.
5. Re-run `testing_agent_v3` to confirm no regressions.

**Optional (Phase 4)**
6. Add image uploads + media library.
7. Add roles + remove dev bypass for production.

---

## 4) Success Criteria
- **Phase 2 (met):**
  - 100% CMS-driven pages and sections (no hardcoding), editable via Admin.
  - Premium UI that matches the reference feel.
  - Home Collection list + detail pages fully functional with gallery/specs/floor plan areas.
  - Packages show correct ₹/Sq.ft pricing and expandable CMS specs.
  - Leads persist to MongoDB and appear in Admin leads inbox.
  - End-to-end testing passes (achieved overall 98%).

- **Phase 3 (target):**
  - Noticeably improved perceived performance (skeletons, lazy loading, no layout shift).
  - Stronger validation and safer admin editing.
  - Pagination/search for large collections.
  - Accessibility improvements verified.
  - `testing_agent_v3` passes with no material gaps (aim 100% across public + admin).