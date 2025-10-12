-- Bookmarks: user can save items to read later
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_id)
);

-- Preferences: user interests (tags)
create table if not exists public.user_prefs (
  user_id uuid primary key,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);
create index if not exists idx_bookmarks_item on public.bookmarks(item_id);

-- Likes: track per-user likes and counts
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_id)
);

create index if not exists idx_likes_user on public.likes(user_id);
create index if not exists idx_likes_item on public.likes(item_id);

