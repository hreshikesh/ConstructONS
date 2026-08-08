# plan.md — ConstructONS Premium CMS-Driven Website (Updated)

## 1) Objectives
- Ship a premium, Apple/Tesla/Stripe/Linear-level marketing + sales platform for **ConstructONS** with luxury UI, **Poppins** typography, and **Framer Motion** micro-interactions.
- Maintain a **fully CMS-driven architecture**: all public pages/sections + detail pages consume **FastAPI + MongoDB** APIs (no hardcoded content).
- Provide a **production-grade Admin Panel** (cookie-based auth) for CRUD on all content types and advanced sales workflows.
- Deliver **lead capture** (Get Free Consultation / Contact) persisted to MongoDB with admin visibility + status workflow.
- Provide a complete **sales enablement ecosystem**:
  - Standardized build packages with deep material specs
  - Package comparison
  - Brochure PDFs
  - Client proposal PDFs + WhatsApp workflow
  - **Custom Quotes**: AI-assisted, fully editable, PDF-exportable bespoke quotations
  - **Quote Templates**: reusable quote baselines to speed up sales
  - **Client Portal**: shareable public quote link for accept/reject + comments
  - **CSV Export**: one-click exports for leads and quiz submissions
- Keep data safe and editable without code changes: **Homes, Packages, FAQs, Leads, Quiz Submissions, Proposals, Custom Quotes, Quote Templates, Site Settings**.

**Current status:** Phases 1–2.5 are complete and stable. Phase 3 (Custom Quotes) is now **COMPLETE** and verified end-to-end in preview. Next work is Phase 4: WYSIWYG editing, exports, templates, and client portal.

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

### Phase 3 — Sales Workflows: Custom Quotes ✅ COMPLETED
**Goal:** Add a new Admin section **Custom Quotes** that lets ConstructONS generate tailored quotations per client requirements, with AI-assisted suggestions, full editability, and share-ready PDF.

Delivered ✅
- New admin section **/admin/custom-quotes** with:
  - Client details + requirements (plot, floors, BHK, budget, start/end)
  - Base package optional loading (deep spec sheet snapshot)
  - Fully editable: deep specs, add-ons, custom line items, pricing, scope, exclusions, schedule, terms
  - Actions: Save, Download PDF, WhatsApp share, Email share, Copy link, Status updates
- **AI Quote Assistant (GPT-5)** supports:
  - Mode A: Recommend + tune (package anchored)
  - Mode B: Build from scratch
- **Async AI job pattern** (job_id + polling) to bypass ingress timeouts.
- PDF generator **custom_quote_pdf.py** and backend CRUD + PDF routes.

Verification ✅
- UI renders and editor drawer works
- Quote CRUD works with sequential refs `CQ-YYYY-0001`
- AI job completes successfully (60–120s typical)
- PDF endpoint returns valid PDF bytes

---

### Phase 4 — Sales Operations Upgrade (Now) 🚧 IN PROGRESS
**Goal:** Finish the "sales operating system" layer requested:
1) Rich Text Editor (WYSIWYG) 
2) CSV export for sales team
3) Quote templates
4) Client portal public quote link with accept/reject + comments

#### 4.1 Rich Text Editor (TipTap) — Admin WYSIWYG
**Goal:** Replace plain textareas / basic HTML input where rich formatting is needed.

Scope
- Install TipTap: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, (optional) `@tiptap/extension-image`
- Create reusable component `RichTextEditor.js` with:
  - Toolbar: Bold, Italic, H1/H2/H3, Bullet list, Numbered list, Quote, Link
  - HTML output compatible with existing `content_html` fields
  - DOMPurify on render (already used in project)

Targets (highest value first)
- Admin Blogs: `content_html`
- Packages: `description` (and optional: section descriptions if present)
- Custom Quotes: `intro_note` and `terms`

Success criteria
- Admin can format content visually without writing HTML.
- Saved HTML renders correctly on public pages/PDFs.


#### 4.2 CSV Export — Leads + Quiz Submissions
**Goal:** One-click downloads for the sales team.

Backend
- Add admin-protected CSV endpoints:
  - `GET /api/leads/export.csv` (filters: optional `status`, date range)
  - `GET /api/quiz-submissions/export.csv` (filters: optional `status`, date range)
- Ensure correct headers:
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="..."`

Frontend
- Add buttons:
  - AdminLeads: "Export CSV"
  - AdminQuizSubmissions: "Export CSV"
- Implementation: open URL in new tab (cookie auth will attach automatically).

Success criteria
- Sales can download and open in Excel/Google Sheets with correct columns.


#### 4.3 Quote Templates — Reuse quote baselines
**Goal:** Save any completed quote as a template and reuse it for new clients.

Backend
- Add model `QuoteTemplate` in `models.py`.
- Collection: `quote_templates`.
- Endpoints (admin):
  - CRUD: `GET/POST/PUT/DELETE /api/quote-templates`
  - `POST /api/custom-quotes/{id}/save-as-template` (creates template from quote snapshot)
  - `POST /api/custom-quotes/from-template/{template_id}` (creates new draft quote prefilled)

Frontend
- New admin page: `AdminQuoteTemplates.js`
- Admin nav entry: "Quote Templates"
- In `AdminCustomQuotes`:
  - "Save as Template" button
  - Template picker dropdown to prefill specs/pricing/scope

Success criteria
- Admin creates a quote template once and can generate new draft quotes in 1 click.


#### 4.4 Client Portal Link — Public quote view with actions + comments
**Goal:** Send a link to the client where they can view the quote, comment, and accept/reject without logging in.

Backend
- Extend `CustomQuote`:
  - `public_token` (random, unguessable)
  - `client_action` (none | accepted | rejected)
  - `client_action_at`
  - `comments`: list of `QuoteComment` (author_name, message, created_at)
- Lazy migration:
  - If a quote is requested without `public_token`, generate and persist one.
- Public endpoints (no admin auth):
  - `GET /api/public/quote/{token}` (returns safe subset of quote)
  - `POST /api/public/quote/{token}/comment`
  - `POST /api/public/quote/{token}/action` (accept/reject)
- Admin endpoints:
  - Admin can view comments and client_action in `/admin/custom-quotes` editor.

Frontend
- Public page route: `/quote/:token` → `PublicQuotePage.js`
  - Premium client UI: header, requirements, pricing summary, downloadable PDF link, spec highlights
  - Comment box + timeline
  - Accept / Reject actions with confirmation
- Admin quote editor updates:
  - Show Public Link with Copy
  - Show comments panel and client action status

Success criteria
- Client can open link, read quote, leave comments, accept/reject.
- Admin sees updates in real-time on next refresh (and optionally via notifications later).

---

## 3) Next Actions

### Immediate — Phase 4 (Build 4 major features in one pass)
1. Add TipTap WYSIWYG editor component and wire into:
   - Blogs `content_html`
   - Packages `description`
   - Custom Quotes `intro_note` + `terms`
2. Add CSV export endpoints + admin buttons for:
   - Leads
   - Quiz Submissions
3. Add Quote Templates:
   - Backend model + endpoints
   - Admin section + template picker
4. Add Client Portal:
   - Tokenised public quote page
   - Accept/reject + comments
   - Admin view of comments + action state
5. Run `testing_agent_v3` + visual checks:
   - WYSIWYG save/render
   - CSV downloads
   - Template create/apply
   - Client portal workflow end-to-end

---

## 4) Success Criteria
- Existing phases remain stable (no regressions).
- Phase 3: Custom Quotes continues to work end-to-end.
- Phase 4:
  - Admin has WYSIWYG editor for key content.
  - Sales can export CSV in one click.
  - Quote templates reduce quote creation time dramatically.
  - Client portal enables accept/reject + comments without login.
  - `testing_agent_v3` passes with no material gaps.
