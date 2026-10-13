# ConstructONS blog SEO and publishing playbook

## What the blog can do


## Topic plan for this business

Build a small set of connected guides around questions ConstructONS can answer from first-hand project experience. Assign one primary search intent to each article and avoid publishing several near-identical pages targeting the same query.

| Topic cluster | Example article angles | Relevant next step |
| --- | --- | --- |
| Construction cost in Bengaluru | What a per-square-foot quote includes; cost drivers and exclusions; sample budget by build stage | Compare packages or request a quote |
| Choosing a builder | Questions to ask a turnkey contractor; how to compare scopes, warranties and payment milestones | Construction packages |
| Planning and approvals | A homeowner's pre-construction checklist; documents and decisions to prepare before work starts | Contact an advisor |
| Materials and quality | How to compare material specifications; site quality checks homeowners can understand | Materials marketplace / quality process |
| Design and home planning | Floor-plan trade-offs; ventilation, daylight and practical Vastu considerations | Home designs / architect marketplace |
| Construction technology | What live site tracking can show; how project updates and approvals should work | ConstructONS project platform |

Treat these as research hypotheses, not verified keyword-volume opportunities. Validate exact terms and demand with Google Search Console query data, customer interviews, and a keyword research source before committing to a production calendar. Prioritize topics where the team has real examples, local context, photos, numbers, or expert review to add.

## Publishing flow

1. Choose a specific homeowner question and the matching cluster. Check existing posts and Search Console to prevent overlap.
2. Brief the writer with the intended reader, one primary query, related questions, a useful answer, first-hand evidence to include, sources for factual claims, and one relevant internal destination.
3. Write for the reader first. Include locally relevant details only when the business can substantiate them. Cite primary sources for rules, prices, engineering, and other changing or high-impact claims; add a review date where facts can change.
4. In **Admin → Blogs**, complete the title, stable lowercase hyphenated slug, excerpt, optional SEO title, search description, topic category, cover image, author, tags, publish date, and article body. Keep `is_published` off while drafting; preview/review, then publish.
5. Before publishing, check that the article answers the promised question, has a descriptive H1, useful headings, original examples, readable mobile layout, meaningful image alt text, working internal links, a unique title and description, and no unsupported claims. The editor currently has no explicit preview or checklist workflow; use this checklist before turning publication on.
6. Link the article from the blog listing and from relevant service/package pages where it helps users. Link from the article to a useful next step and to reputable sources where needed.
7. After deployment, submit the sitemap in Google Search Console. Inspect a new important URL and request indexing once if useful; that request is a hint, not a guarantee. Monitor indexed status, impressions, clicks and queries, then improve pages using actual data.

## How Google discovers and indexes a post

Google can discover a post through crawlable links and the sitemap. It may fetch the page, render JavaScript, interpret the content and metadata, assess canonical/indexing signals, and then decide whether and when to index it. Indexed does not mean it will rank prominently. This project currently uses a React client-rendered frontend: blog text is fetched from the API after the initial HTML loads. Google can render JavaScript, but server/static rendering is a more dependable delivery path for important article content and helps crawlers that do not render JS. The FastAPI app now serves `/sitemap.xml` from current published CMS records. For the EC2 deployment, Nginx must proxy the public exact path `/sitemap.xml` to FastAPI on port 8000; the setup block and verification steps are in `EC2_SITEMAP_SETUP.md`. The static `frontend/public/robots.txt` already points to the public root sitemap URL.

Recommended next technical phase: serve blog article HTML and metadata in initial HTML using SSR/SSG or a reliable prerendering layer. Keep article URLs stable, self-canonical, linked from the blog hub, and exclude unpublished content. Verify the live sitemap after deployment, then use Search Console URL Inspection and sitemap reports.

## What changed in this implementation

The blog admin now supports an optional SEO title, meta description, category and publish date/time, with keyboard-editable date and time fields plus Today and Now shortcuts. The public blog hub can filter posts by category. Article pages use the custom search description and tags, display the publication date, and include available publish/modified dates and category in `BlogPosting` structured data. Missing article slugs now render a noindex not-found state instead of an empty, indexable article template. The FastAPI endpoint in `backend/server.py` generates the public sitemap dynamically from published CMS records.

## Sources

- [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: SEO guide for web developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
- [Google Search Central: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search Central: Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search Console: URL Inspection](https://support.google.com/webmasters/answer/9012289)
