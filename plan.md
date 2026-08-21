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
  - **Interior Library**: curated interior items with brand pricing to drop into quotes
  - **Drawing Sheets**: floor plans/elevations with CAD title blocks + revision history
  - **Live PDF Preview**: real-time branded PDF rendering inside the quote editor

### NEW (Major Objective)
Build a **customer-facing AI chat portal** (ChatGPT/Claude-level UX) that spans the full construction lifecycle:
- Customers can select and discuss packages via chat, generate quotes, request visuals/documents, and confirm projects.
- Once booked, customers track a **milestone-based project timeline** from discovery → handover.
- All actions are **synced to backend state** (quotes, projects, stages, docs, audit logs) and are visible to admins.

**Current status:** Phases 1–4.8 are complete and stable in preview. Next major work is Phase 5: **Customer AI Chat Portal + Milestone Tracker**.

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
- **AI Quote Assistant**:
  - Mode A: Recommend + tune (package anchored)
  - Mode B: Build from scratch
  - Async AI job pattern (job_id + polling)
- PDF generator + CRUD + PDF routes.

Verification ✅
- UI renders and editor drawer works
- Quote CRUD works with sequential refs `CQ-YYYY-0001`
- AI job completes successfully
- PDF endpoint returns valid PDF bytes

---

### Phase 4 — Sales Operations Upgrade ✅ COMPLETED
**Goal:** Finish the "sales operating system" layer.

#### 4.1 Rich Text Editor (TipTap) ✅
- TipTap WYSIWYG installed and reusable `RichTextEditor` added.
- Wired into:
  - Blogs `content_html`
  - Custom Quotes `intro_note`, `terms`
- Rendered HTML styled via `.rich-html` and sanitized with DOMPurify.

#### 4.2 CSV Export ✅
- Admin-protected endpoints:
  - `GET /api/exports/leads.csv`
  - `GET /api/exports/quiz-submissions.csv`
- Admin buttons added to Leads and Quiz Submissions.

#### 4.3 Quote Templates ✅
- QuoteTemplates collection + CRUD endpoints.
- Admin page `/admin/quote-templates` with card grid.
- Save-as-template + create-from-template flows.

#### 4.4 Client Portal Link ✅
- Tokenized public route `/quote/:token`.
- Client can view, comment, accept/reject.
- Admin sees comments + action status.

#### 4.5 Quote Enhancements (Service Charge, Interiors, Drawings, Visual Boards) ✅
- Replaced GST with **15% service charge** default.
- Added per-item **rates**, **units**, **notes**, and billable toggles.
- Added **Interiors** category editor.
- Added **Floor Plans** and **Elevations** with CAD title blocks.
- Added **Visual Boards** with uploads + AI image generation.
- Rebranded custom quote PDF to match brochure look.

#### 4.6 AI Image Generation ✅
- `/api/ai/generate-image` using Gemini Nano Banana + Object Storage.

#### 4.7 Live PDF Preview ✅
- `POST /api/custom-quotes/preview` returns PDF from unsaved payload.
- Admin quote editor split view: form left, live PDF iframe right.

#### 4.8 Interior Library + Drawing Revisions ✅
- Interior Library seeded (70+ items across 9 categories).
- Picker modal with search/tabs and inline rate/qty overrides.
- Drawing revisions (A/B/C...) tracked per sheet and rendered in PDF.

---

### Phase 5 — Customer-Facing AI Chat Portal + Milestone Tracker 🚧 NEXT
**Goal:** Build a customer portal where users can select packages and manage the entire construction journey through an AI chat + milestone tracker, with backend-synced state.

**Decisions locked ✅**
- Auth: **Both** — Email OTP + Google OAuth (Emergent Auth)
- Scope: **Phase 1 + 2** of portal — Auth + Chat + Booking → Milestone tracker
- AI: **Multi-model**
  - Chat: **GPT-4o-mini** (fast + streaming)
  - Quotes: **GPT-5** (existing Custom Quote system)
  - Images: **Nano Banana** (existing)
  - Advanced reasoning optional: **Claude Sonnet 4**
  - Model selector in chat
- Quote linkage: AI recommendation → **creates draft Custom Quote** → customer views/comments via existing public link
- Milestones: Use standard 10 stages
- Chat UX: ChatGPT/Claude-like — streaming, file uploads, image gen, PDF/HTML blocks

---

## 3) Next Actions

### Phase 5.1 — Customer Auth + Portal Shell
Backend
- Add models:
  - `Customer` (profile, contact, auth providers)
  - `CustomerSession` (cookie-based)
  - `OtpCode` (6-digit, 5 min expiry, rate limited)
- Auth routes:
  - `POST /api/customer/signup` (email OTP start)
  - `POST /api/customer/verify-otp`
  - `POST /api/customer/login`
  - `GET /api/customer/me`
  - Google OAuth via Emergent Auth:
    - `GET /api/customer/auth/google/start`
    - `GET /api/customer/auth/google/callback`
- Security:
  - throttling, OTP replay protection, ip/user limits

Frontend
- `/portal/login`
  - Email OTP flow
  - Google sign-in
- `/portal` layout
  - left sidebar (conversations)
  - main chat window

### Phase 5.2 — Streaming Chat + Tool Calling
Backend
- `POST /api/chat/message` (SSE streaming)
- Conversation storage in MongoDB:
  - `conversations`, `messages` (role, text, attachments, tool_calls)
- Tool calls available to AI:
  - `list_packages` (returns 4 packages as cards)
  - `recommend_package(brief)` (rationale + top 1–3)
  - `create_quote(package_slug, params)` → creates CustomQuote + returns public link
  - `generate_image(prompt)` → stores image and returns URL
  - `render_html(html)` → safe HTML block
  - `create_lead()` → optional, to sync sales follow-ups
- Model selector
  - GPT-4o-mini default; Claude Sonnet 4 optional; GPT-5 for quote gen tasks

Frontend
- Claude/ChatGPT-style chat UI:
  - streaming assistant tokens
  - rich message renderer: package cards, quote link cards, images, PDF preview blocks, HTML blocks
  - file upload (reuse `/api/media/upload`)

### Phase 5.3 — Booking → Project Creation + Milestone Tracker
Backend
- New `Project` model:
  - created when quote status becomes `accepted`
  - contains 10 seeded stages:
    Discovery → Design → Approvals → Booking → Site Prep → Foundation → Structure → Walls & MEP → Finishing → Handover
  - stage fields: status, expected_date, progress_pct, docs/photos, notes, customer_signoff
- Routes:
  - `GET /api/projects/mine`
  - `GET /api/projects/{id}`
  - `POST /api/projects/{id}/stages/{stage_id}/signoff`
- Audit log:
  - `milestone_events` collection
- Automation:
  - stage update → auto-post message into conversation

Frontend
- `/portal/project`
  - vertical timeline of 10 stages
  - per-stage: status, uploads, notes, signoff

Admin
- `/admin/projects`
  - stage manager UI
  - upload photos/docs per stage
  - push updates into customer chat

### Phase 5.4 — Quality Bar + Testing
- SSE streaming reliability
- Auth session integrity
- XSS hardening for HTML blocks
- File type validation and size limits
- `testing_agent_v3` pass + screenshot verification for portal

---

## 4) Success Criteria
- Existing phases remain stable (no regressions).
- Sales stack remains stable:
  - Custom quotes, templates, portal links, exports, preview, interior library, drawings
- New portal delivers:
  - Customer can log in (OTP + Google)
  - Customer can chat with streaming AI and browse the 4 packages
  - Chat can produce a Custom Quote draft and send a public link
  - Upon acceptance, a Project is created with 10 stages
  - Customer can track milestones and sign off stages
  - Admin can update stages and uploads; changes sync to customer chat
- Production readiness:
  - Works on custom domain with cookie security
  - Environment variables documented and validated on boot
