-- FoodMatch schema, increment 3: restaurateur ownership + admin review.
-- Idempotent (safe to re-run). Apply AFTER schema.sql and schema-users.sql, by
-- pasting into the Supabase SQL editor. SAFE to apply now: the new policies are
-- INERT until the admins table has rows and restaurants get an owner_id, so
-- nothing about today's access changes until that data is populated.

-- ---------- restaurant ownership ----------
alter table public.restaurants add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists restaurants_owner_idx on public.restaurants(owner_id);

-- ---------- admins (founders / staff) ----------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- A user may check whether THEY are an admin (reads only their own row; no recursion).
drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins
  for select to authenticated using (auth.uid() = user_id);
grant select on public.admins to authenticated;
-- Rows are added only via the service role / SQL editor (no insert policy), so a
-- user can never make themselves an admin through the API.

-- ---------- claim review status ----------
alter table public.restaurant_claims add column if not exists status text not null default 'pending';

-- ---------- admin write access (gated by membership in admins) ----------
drop policy if exists "admin read claims" on public.restaurant_claims;
create policy "admin read claims" on public.restaurant_claims
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admin update claims" on public.restaurant_claims;
create policy "admin update claims" on public.restaurant_claims
  for update to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admin update restaurants" on public.restaurants;
create policy "admin update restaurants" on public.restaurants
  for update to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

grant update on public.restaurant_claims to authenticated;
grant update on public.restaurants to authenticated;
