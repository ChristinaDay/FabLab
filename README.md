This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database: Homepage Curation Fields

Add two optional integer columns to `items` to enable curated home placement: `featured_rank` (1 = top hero priority) and `pick_rank` (ordering for Today's Picks). Run the SQL below in Supabase SQL editor or via psql.

```sql
-- scripts/sql/homepage_curation.sql
alter table if exists public.items
  add column if not exists featured_rank integer null,
  add column if not exists pick_rank integer null;

create index if not exists items_featured_rank_idx on public.items (featured_rank asc nulls last);
create index if not exists items_pick_rank_idx on public.items (pick_rank asc nulls last);
create index if not exists items_visible_published_idx on public.items (visible, published_at desc);

alter table if exists public.items
  add constraint if not exists items_featured_rank_positive check (featured_rank is null or featured_rank > 0),
  add constraint if not exists items_pick_rank_positive check (pick_rank is null or pick_rank > 0);
```

Using psql locally:

```bash
psql "$SUPABASE_DB_URL" -f scripts/sql/homepage_curation.sql
```

After migrating, go to `/admin` and set ranks per item.
