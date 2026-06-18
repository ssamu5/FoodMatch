-- FoodMatch schema, increment 2: per-user data (favorites + taste profiles).
-- Idempotent (safe to re-run). Apply by pasting this whole file into the
-- Supabase SQL editor (Dashboard > SQL Editor > New query > Run), AFTER schema.sql.
--
-- These tables are keyed by the Supabase Auth user id (auth.users.id) and are
-- protected by RLS so each signed-in user can only read and write their OWN rows.
-- The app keeps a localStorage copy for offline use and merges into these tables
-- on sign-in (see lib/userData.ts).

-- ---------- favorites: a user's saved restaurants ----------
create table if not exists public.favorites (
  user_id       uuid not null references auth.users(id) on delete cascade,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

create index if not exists favorites_user_idx on public.favorites(user_id);

alter table public.favorites enable row level security;

drop policy if exists "favorites owner select" on public.favorites;
create policy "favorites owner select" on public.favorites
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "favorites owner insert" on public.favorites;
create policy "favorites owner insert" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites owner delete" on public.favorites;
create policy "favorites owner delete" on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, delete on public.favorites to authenticated;

-- ---------- taste_profiles: one row per user ----------
create table if not exists public.taste_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  favorite_cuisines text[] not null default '{}',
  preferred_areas   text[] not null default '{}',
  dietary           text[] not null default '{}',
  vibe_preferences  text[] not null default '{}',
  budget_comfort    int,
  email             text,
  updated_at        timestamptz not null default now()
);

alter table public.taste_profiles enable row level security;

drop policy if exists "taste owner select" on public.taste_profiles;
create policy "taste owner select" on public.taste_profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "taste owner upsert" on public.taste_profiles;
create policy "taste owner upsert" on public.taste_profiles
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "taste owner update" on public.taste_profiles;
create policy "taste owner update" on public.taste_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.taste_profiles to authenticated;

-- ---------- storage: restaurant-images bucket (hero images) ----------
-- The hero-image generator (scripts/generateHeroImage.mjs) creates this bucket
-- and uploads via the service-role key. Define it here too so it exists and is
-- publicly readable regardless of whether the generator has run yet.
insert into storage.buckets (id, name, public)
values ('restaurant-images', 'restaurant-images', true)
on conflict (id) do nothing;

drop policy if exists "restaurant-images public read" on storage.objects;
create policy "restaurant-images public read" on storage.objects
  for select using (bucket_id = 'restaurant-images');
