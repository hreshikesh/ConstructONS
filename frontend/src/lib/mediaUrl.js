/**
 * Resolves media URLs to absolute backend URLs or Cloudinary CDN links.
 */
export function resolveMediaUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("data:") ||
    u.startsWith("blob:")
  ) {
    return u;
  }
  const backend = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(
    /\/$/,
    ""
  );
  return u.startsWith("/") ? `${backend}${u}` : `${backend}/${u}`;
}