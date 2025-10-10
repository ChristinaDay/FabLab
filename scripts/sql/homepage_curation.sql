-- Add homepage curation fields to items
alter table if exists public.items
  add column if not exists featured_rank integer null,
  add column if not exists pick_rank integer null;

-- Helpful indexes
create index if not exists items_featured_rank_idx on public.items (featured_rank asc nulls last);
create index if not exists items_pick_rank_idx on public.items (pick_rank asc nulls last);
create index if not exists items_visible_published_idx on public.items (visible, published_at desc);

-- Optional: basic constraints
-- ensure ranks are positive
alter table if exists public.items
  add constraint if not exists items_featured_rank_positive check (featured_rank is null or featured_rank > 0),
  add constraint if not exists items_pick_rank_positive check (pick_rank is null or pick_rank > 0);


