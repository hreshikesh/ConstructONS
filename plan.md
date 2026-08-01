# plan.md — ConstructONS Premium CMS-Driven Website

## 1) Objectives
- Ship a premium, Apple/Tesla/Stripe/Linear/OpenAI/Airbnb-feel marketing website for **ConstructONS** with pixel-perfect UI, luxury spacing, Poppins typography, and Framer Motion micro-interactions.
- Build a **fully CMS-driven architecture**: all homepage sections + detail pages consume FastAPI + MongoDB APIs (no hardcoded content).
- Provide a **simple Admin Panel** (JWT-protected; allow bypass token in dev) for CRUD on all content types.
- Deliver **lead capture** (Get Free Consultation / Contact) persisted to MongoDB with admin visibility.
- Seed the DB with high-quality **sample content + curated Unsplash/Pexels images**.

## 2) Implementation Steps

### Phase 1 — Core CMS Data Flow (No POC needed; build directly)
**Goal:** Prove end-to-end dynamic rendering for the most business-critical flow.

User stories (Phase 1)
1. As a visitor, I can load the homepage and see hero + home cards rendered from the database.
2. As a visitor, I can open a Home Collection detail page and see full specs + gallery from the database.
3. As a visitor, I can submit “Get Free Consultation” and my lead is saved.
4. As an admin, I can log in (dev token) and edit a home’s price/specs and see it update on the site.
5. As an admin, I can add/remove gallery images for a home and the detail page updates.

Backend
- Create MongoDB connection, base models, and common CRUD utilities.
- Define core schemas + endpoints:
  - `homes` (collection listing) + `home_designs`/`floorplans` embedded or linked
  - `media` (image assets/hero banners)
  - `site_settings` (singleton: contact info, nav/footer links)
  - `leads` (consultation/contact submissions)
- Add **seed script** to populate: hero, 6 homes, contact settings, sample media.

Frontend
- Set design system tokens (Tailwind theme): colors, shadows, radii, typography; add Poppins.
- Build API client + React Query (or lightweight fetch hooks) for caching/loading states.
- Implement:
  - Home page skeleton with Hero + Home Collection section (dynamic)
  - Home detail route `/homes/:slug`
  - Lead form modal/page wired to API
- Establish animation primitives (FadeUp, HoverLift, Glow, Progress bars) via Framer Motion.

Checkpoint
- Manual verify: seed → API → homepage + detail → lead saved → admin edit reflects.

---

### Phase 2 — V1 Website + Admin Panel (MVP complete)
**Goal:** Implement all required sections CMS-driven + basic admin CRUD.

User stories (Phase 2)
1. As a visitor, I can browse Build Packages and expand to see specs, warranty, timeline, AI features.
2. As a visitor, I can explore Marketplace + Financial Services cards and see “Coming Soon” where applicable.
3. As a visitor, I can read FAQs and Blogs populated from the CMS.
4. As an admin, I can manage packages (pricing/specs) and the pricing section updates instantly.
5. As an admin, I can manage testimonials/FAQs/blogs/team/contact info without code changes.

Backend
- Add remaining schemas + CRUD endpoints:
  - `packages` + `package_specs` (structured sections; feature flags like “most_popular”)
  - `testimonials` (rating, media type, video url, photo)
  - `faqs`
  - `blogs` (slug, author, cover, sections)
  - `marketplace_categories`
  - `financial_services`
  - `team_members`
  - `hero_sections` + `banner_images`
  - `galleries` (general media gallery)
- Admin auth (simple):
  - JWT login endpoint (env-based admin user)
  - Dev bypass token for local/testing
  - Basic role guard for admin routes

Frontend (Site)
- Build full homepage sections (CMS-driven):
  - Sticky Header + CTA
  - Hero with floating AI dashboard cards
  - Home Collection carousel/grid + filters (optional MVP)
  - Packages pricing cards w/ expand
  - AI Platform “included” modules + dashboard mock images
  - Marketplace + Financial Services
  - Why ConstructONS comparison table
  - Customer Journey animated timeline
  - Testimonials slider
  - Contact section (call/whatsapp/email/map + lead form)
  - Footer
- Add About page and Blog listing/detail routes.
- SEO basics: meta tags per route, OpenGraph defaults.

Frontend (Admin)
- Admin routes `/admin/*` with CRUD screens:
  - Table + create/edit drawer for each entity
  - Image URL management for media (URL-based MVP)
  - Leads inbox view with status (new/closed)

Testing (end of Phase 2)
- Run **testing_agent_v3** end-to-end:
  - Homepage renders all sections from API
  - Home detail route works
  - Lead submission saved + visible in admin
  - Admin CRUD updates reflect on site

---

### Phase 3 — Polish Pass + Production Hardening
**Goal:** Make it feel world-class (motion, spacing, performance) and reduce bugs.

User stories (Phase 3)
1. As a visitor, the site feels fast with smooth transitions and no layout shifts.
2. As a visitor on mobile, every section remains premium and readable with touch-friendly UI.
3. As an admin, I can safely edit content with validation errors shown clearly.
4. As a visitor, images load progressively and never block interaction.
5. As an owner, I can rely on consistent content ordering and visibility toggles.

Backend
- Validation + constraints (required fields, slug uniqueness, ordering indexes).
- Add `status`/`visibility` + `sort_order` across entities.
- Improve list endpoints with pagination + search (blogs, homes, leads).

Frontend
- Add skeleton loaders, lazy image loading, blur-up placeholders.
- Enhance motion: scroll-triggered reveals, hover glow, button ripple, counters.
- Accessibility: focus states, aria for dialogs/accordions, contrast checks.
- Refine UI consistency (card components, spacing scale, typography rhythm).

Testing (end of Phase 3)
- Run **testing_agent_v3** again across:
  - CRUD regression
  - Mobile responsiveness
  - Broken links/routes
  - Form validation + error states

---

### Phase 4 — Auth/Permissions + Optional Enhancements (post-approval)
**Goal:** Tighten admin security + optionally add uploads.

User stories (Phase 4)
1. As an admin, I can have separate roles (editor vs owner).
2. As an admin, I can upload images instead of pasting URLs.
3. As an admin, I can preview draft content before publishing.
4. As an owner, I can export leads as CSV.
5. As a visitor, I can see only published content and never drafts.

Items (optional)
- Replace dev bypass with proper login-only + refresh tokens.
- Role-based permissions.
- Media upload support (S3-compatible or local) if desired.
- Content revisions/drafts.

## 3) Next Actions
1. Create DB models + seed script for: hero, homes, media, site settings, leads.
2. Implement FastAPI CRUD endpoints + CORS for React.
3. Build React homepage + home detail + lead form consuming APIs.
4. Add Admin panel MVP (JWT/dev token) with CRUD for homes + leads first.
5. Expand to remaining CMS entities and finish all homepage sections.
6. Run testing_agent_v3 after Phase 2 and Phase 3.

## 4) Success Criteria
- **100% CMS-driven**: all listed sections editable via Admin without code changes.
- Homepage matches reference layout and feels premium: spacious, minimal, luxury, smooth motion.
- Home Collection list + detail pages fully functional with gallery/specs/floor plan area.
- Packages show correct ₹/sq.ft pricing and expandable specs from DB.
- Lead forms reliably persist to MongoDB and appear in admin inbox.
- Testing_agent_v3 passes end-to-end with no blocking UX defects.