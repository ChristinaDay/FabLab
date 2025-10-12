<!-- 85f358c1-8c27-458c-ba3c-98b33c663476 aec7df47-a0b8-42e4-847e-89ca46f8229c -->
# Add “Add by URL” ingestion for social posts

## What we’ll build

Enable admins to paste any shareable URL (Instagram/Facebook post, or any article). The server fetches Open Graph metadata and upserts an `items` row with title, image, description, and source; deduped by `link`.

## Files to touch

- `pages/index.tsx`: add a "From Social" aside module; SSR fetch latest items tagged `social`.
- `pages/topstories.tsx`: add a "From Social" aside module; SSR fetch latest items tagged `social`.

- `lib/extractOg.ts`: add a new `extractOpenGraph(url)` to return `{ title, description, image, siteName }` reusing headers from `extractOpenGraphImage`.
- `pages/api/admin/preview-og.ts` (new): GET `?url=` → returns `{ title, description, image, site }` for UI preview.
- `pages/api/admin/items-upsert-from-url.ts` (new): POST `{ url, tags?: string[], visible?: boolean }` → upserts item using OG metadata; `source = siteName || domain(host)`; sets `published_at = now`.
- `pages/admin/index.tsx`: add an "Add content by URL" card with: URL input, Preview button (calls preview endpoint), tag checkboxes/text input, Publish button (calls upsert endpoint). Show preview card matching site card UI.

## Behavior details

- Use a browser-like UA + Referer (domain) headers; timeout 8s; graceful fallback when OG missing.
- Dedupe on `link` (existing upsert constraint covers this).
- Default `visible=true` checkbox; admin can toggle. Items publish visible by default.
- Tags optional; map to existing categories when provided.
- Handle Instagram/Facebook and any shareable URL:
- Use public share/post URLs; extract comprehensive Open Graph/Twitter metadata: `og:title`, `og:description`, `og:image` (prefer secure), `og:site_name`, `og:url`/canonical, `twitter:*`, `article:published_time`, `article:author`.
- If `og:image` missing, fall back to first `<img>` in HTML.
- Don’t embed; we only link out and display thumbnail/text.
- Persist core fields to existing columns:
- `title` ← `og:title` | `<title>`
- `excerpt` ← `og:description`
- `thumbnail` ← best image
- `source` ← `og:site_name` | hostname
- `link` ← canonical `og:url` | submitted URL
- `published_at` ← `article:published_time` | now
- Also persist full metadata to a new optional `items.og_meta` JSONB column for completeness (share link metadata).

## Risks/notes

- Some IG/FB pages may block servers; our UA/Referer helps, but fallback is posting without image.
- Image URLs may expire; acceptable for first iteration. Future: proxy/cache images.
- Optionally add rate limiting later.

### To-dos

- [ ] Add extractOpenGraph(url) to lib/extractOg.ts
- [ ] Create GET /api/admin/preview-og for OG metadata
- [ ] Create POST /api/admin/items-upsert-from-url
- [ ] Add “Add content by URL” section in pages/admin/index.tsx
- [ ] Test with example IG and Facebook post URLs
- [ ] Add short README/admin help for using Add-by-URL

### Follow-up: Reliable Instagram/Facebook previews via Graph oEmbed

- [ ] Create Meta app; obtain FB_APP_ID and FB_APP_SECRET
- [ ] Add FB_APP_ID/FB_APP_SECRET to env and deployment
- [ ] Use Graph oEmbed in preview-og for IG/FB
- [ ] Use Graph oEmbed in items-upsert-from-url for IG/FB
- [ ] Admin Add-by-URL: manual image input fallback
- [ ] Document Meta app setup and env vars in README