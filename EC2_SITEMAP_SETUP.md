# Dynamic sitemap on the EC2 deployment

The FastAPI app now serves a fresh XML sitemap at `/sitemap.xml`. It combines the site's public static routes with every CMS blog whose `is_published` flag is true. The article slug and last-modified date are read from MongoDB on each request, so publishing, unpublishing, or changing a slug updates the sitemap without rebuilding React. `robots.txt` already points to `https://constructons.com/sitemap.xml`.

## Route the public sitemap to FastAPI

This repository does not contain the EC2 Nginx configuration. If Nginx serves the React build at the domain root and proxies the backend on port 8000, add this exact-location block inside the existing `server` block, before any general static-file or SPA fallback rules:

```nginx
location = /sitemap.xml {
    proxy_pass http://127.0.0.1:8000/sitemap.xml;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Reload Nginx after validating its configuration. The checked-in `frontend/public/sitemap.xml` remains a static fallback for other hosting modes; the EC2 Nginx exact match must take priority for the live site to become dynamic. Do not point `robots.txt` at `/api/sitemap.xml`; it already references the public root URL.

## Verify after deployment

1. Open `https://constructons.com/sitemap.xml`. It should return HTTP 200 with `Content-Type: application/xml`.
2. Confirm a currently published post appears as `https://constructons.com/blog/{slug}` and an unpublished post does not.
3. Change a post slug in Admin, then reload the sitemap. The new slug should appear without rebuilding the frontend. The previous article URL will need a redirect if people or search engines already know it.
4. In Google Search Console, open **Sitemaps** and confirm the existing `/sitemap.xml` submission has a recent successful read. The sitemap URL itself does not change, so resubmission is generally unnecessary. Inspect important new article URLs when needed.

Sitemap discovery is a crawl hint; it does not force Google to crawl or index every URL. Keep published posts linked from `/blog`, and make sure each article provides useful, substantive content. The React article pages still fetch content client-side, so server-rendered article HTML remains a worthwhile separate SEO improvement.
