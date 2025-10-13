<!-- 2b745f14-7ec7-4474-9e03-7d196ac39ec3 05bd7e8f-d4bb-469f-9d36-105842add4a7 -->
# Dashboard categories and interests

## Goal

- Keep category row behavior consistent as navigation on article pages.
- Hide category row on `/dashboard`.
- Add an Interests strip on `/dashboard` with clear semantics: shows followed tags and allows managing them.

## Changes

### 1) Hide category row on `/dashboard`

- File: `components/Nav.tsx`
- Update categories-row render condition to exclude `/dashboard`:
```js
const isAdminRoute = router.pathname.startsWith('/admin')
const showCategories = !isAdminRoute && !['/jobs','/dashboard'].includes(router.pathname)
```

- Replace current `{!isAdminRoute && (...)}` with `{showCategories && (...)}`

### 2) Dashboard interests strip

- File: `pages/dashboard.tsx`
- At top of `<main>`, add a compact strip labeled “Your interests”:
  - Chips for each tag in `prefs` with a subtle style.
  - An “Edit interests” button opens the existing add-tag form (scrolls to section).
  - Optional quick actions: remove tag (×) on chip.

Essential snippet:

```tsx
<section className="mb-6">
  <div className="text-sm text-black/70">Your interests</div>
  <div className="mt-2 flex flex-wrap gap-2">
    {prefs.map(t => (
      <span key={t} className="px-2 py-1 text-sm border rounded">
        {t}
        <button onClick={() => removeTag(t)} className="ml-1 text-black/60">×</button>
      </span>
    ))}
    <a href="#edit-interests" className="underline text-sm">Edit interests</a>
  </div>
</section>
```

- Implement `removeTag(tag)` that updates state and calls `/api/user/prefs-upsert`.
- Add `id="edit-interests"` to the existing interests management section.

### 3) Optional: Dashboard filter (deferred)

- If needed later, add a small “Filter list” bar to filter bookmarks locally by selected interests; distinct label to avoid confusion with global nav.

## Notes

- No DB changes required; reuses `user_prefs`.
- All work stays on `feature/user-dashboard` branch.

### To-dos

- [ ] Hide categories row on dashboard via Nav.tsx logic
- [ ] Add interests strip to dashboard with remove and edit link
- [ ] Implement removeTag and persist via prefs-upsert