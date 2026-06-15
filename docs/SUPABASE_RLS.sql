-- =============================================================================
-- FoodMatch Supabase Row Level Security (RLS) policies
-- =============================================================================
--
-- These are the policies that make the public anon key safe to ship in the
-- client. The frontend uses VITE_SUPABASE_ANON_KEY, which is public by design
-- (see frontend/.env.example and docs/SECURITY.md). Security is NOT enforced by
-- hiding that key; it is enforced here, by RLS. With RLS enabled and these
-- policies in place, the anon key can only do what the policies allow.
--
-- HOW TO APPLY:
--   Paste this file into the Supabase SQL editor (or run via the Supabase CLI)
--   against the FoodMatch project. Re-run is safe: policies are dropped before
--   being (re)created.
--
-- TABLE NAMES:
--   Table names are snake_case and MUST match the Prisma @@map values in
--   backend/prisma/schema.prisma:
--     restaurants, dishes, reviews, favorites, recommendation_feedback,
--     analytics_events, leads, taste_profiles, users.
--
-- KEEPING IN SYNC:
--   The Prisma schema (the production Express + Postgres backend) and the
--   Supabase tables are two backends for the same data (see
--   docs/DATABASE_ARCHITECTURE.md, "Two data backends"). When the Prisma schema
--   changes (a renamed column, a new table, a changed ownership column), update
--   these policies and the Supabase tables to match, or the two paths drift and
--   RLS may either leak data or block legitimate access.
--
-- IDENTITY MODEL:
--   These policies assume the row owner is identified by auth.uid() matching the
--   table's user id column (the `users.id` is the Supabase auth user id, and
--   owned tables carry a user_id FK to it). The service role bypasses RLS
--   entirely and is used only server-side (data loads, admin tasks); it is never
--   shipped to the client.
-- =============================================================================


-- =============================================================================
-- restaurants: public read, owner/service write
-- =============================================================================
-- Public listings must be readable by everyone (anon + authenticated) so the
-- discovery product works for logged-out users. Writes are restricted to the
-- claimed owner (restaurants.owner_id) or the service role. A PUBLIC_BASIC
-- listing has no owner_id, so it is effectively read-only from the client until
-- a claim is approved server-side.

alter table public.restaurants enable row level security;

drop policy if exists restaurants_select_public on public.restaurants;
create policy restaurants_select_public
  on public.restaurants
  for select
  to anon, authenticated
  using (true);

drop policy if exists restaurants_update_owner on public.restaurants;
create policy restaurants_update_owner
  on public.restaurants
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Inserts and deletes of restaurant rows are intentionally NOT granted to anon
-- or authenticated clients. Listing creation (from public data) and deletion
-- happen server-side with the service role, which bypasses RLS.


-- =============================================================================
-- dishes: public read, owner-of-restaurant write
-- =============================================================================
-- Menu items are public. A restaurateur may edit dishes only for a restaurant
-- they own (joined via dishes.restaurant_id -> restaurants.owner_id).

alter table public.dishes enable row level security;

drop policy if exists dishes_select_public on public.dishes;
create policy dishes_select_public
  on public.dishes
  for select
  to anon, authenticated
  using (true);

drop policy if exists dishes_write_owner on public.dishes;
create policy dishes_write_owner
  on public.dishes
  for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = dishes.restaurant_id
        and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = dishes.restaurant_id
        and r.owner_id = auth.uid()
    )
  );


-- =============================================================================
-- users: each row readable/writable only by its owner
-- =============================================================================
-- A user row (id = the Supabase auth user id) is visible and editable only to
-- that user. No anon access. Account creation is handled by Supabase auth /
-- server-side, so no client insert policy is granted here.

alter table public.users enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());


-- =============================================================================
-- taste_profiles: readable/writable only by its owner
-- =============================================================================
-- One profile per user (taste_profiles.user_id). Owner-only for select, insert,
-- update, and delete. No anon access: taste data is personal.

alter table public.taste_profiles enable row level security;

drop policy if exists taste_profiles_select_owner on public.taste_profiles;
create policy taste_profiles_select_owner
  on public.taste_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists taste_profiles_insert_owner on public.taste_profiles;
create policy taste_profiles_insert_owner
  on public.taste_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists taste_profiles_update_owner on public.taste_profiles;
create policy taste_profiles_update_owner
  on public.taste_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists taste_profiles_delete_owner on public.taste_profiles;
create policy taste_profiles_delete_owner
  on public.taste_profiles
  for delete
  to authenticated
  using (user_id = auth.uid());


-- =============================================================================
-- favorites: authenticated insert, owner-scoped everything
-- =============================================================================
-- A diner can save restaurants. Each favorite is owned by auth.uid() via
-- favorites.user_id. Owners can read, insert, and delete their own favorites.

alter table public.favorites enable row level security;

drop policy if exists favorites_select_owner on public.favorites;
create policy favorites_select_owner
  on public.favorites
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists favorites_insert_owner on public.favorites;
create policy favorites_insert_owner
  on public.favorites
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists favorites_delete_owner on public.favorites;
create policy favorites_delete_owner
  on public.favorites
  for delete
  to authenticated
  using (user_id = auth.uid());


-- =============================================================================
-- reviews: public read, authenticated insert, owner-scoped edit/delete
-- =============================================================================
-- First-party reviews are public (they are social proof). Only authenticated
-- users can write, and a review row is owned by auth.uid() via reviews.user_id.
-- Note: owner replies (reviews.owner_response) are written server-side by the
-- restaurant owner flow, not by this diner-facing policy set.

alter table public.reviews enable row level security;

drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public
  on public.reviews
  for select
  to anon, authenticated
  using (true);

drop policy if exists reviews_insert_owner on public.reviews;
create policy reviews_insert_owner
  on public.reviews
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists reviews_update_owner on public.reviews;
create policy reviews_update_owner
  on public.reviews
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists reviews_delete_owner on public.reviews;
create policy reviews_delete_owner
  on public.reviews
  for delete
  to authenticated
  using (user_id = auth.uid());


-- =============================================================================
-- recommendation_feedback: authenticated insert, owner-scoped, no public read
-- =============================================================================
-- Diner feedback on recommendations (good / bad / tried / saved). Inserted by
-- authenticated users, owned by auth.uid() via recommendation_feedback.user_id.
-- Feedback is analytics, not public content, so there is no anon select.

alter table public.recommendation_feedback enable row level security;

drop policy if exists rec_feedback_insert_owner on public.recommendation_feedback;
create policy rec_feedback_insert_owner
  on public.recommendation_feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists rec_feedback_select_owner on public.recommendation_feedback;
create policy rec_feedback_select_owner
  on public.recommendation_feedback
  for select
  to authenticated
  using (user_id = auth.uid());

-- Aggregation across all users (for the KPIs in docs/DATABASE_ARCHITECTURE.md)
-- runs server-side with the service role, which bypasses RLS.


-- =============================================================================
-- analytics_events: insert-only from clients, no client read
-- =============================================================================
-- Product analytics. Clients (anon and authenticated) may INSERT events, but
-- may NOT read them back. There are deliberately no select/update/delete
-- policies, so RLS denies those operations to the anon key. Reading and
-- aggregation happen server-side with the service role.

alter table public.analytics_events enable row level security;

drop policy if exists analytics_insert_any on public.analytics_events;
create policy analytics_insert_any
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);


-- =============================================================================
-- leads: insert-only from clients, no client read
-- =============================================================================
-- Diner email capture, restaurant onboarding, and booking intents. Clients may
-- INSERT leads (the onboarding and email-capture forms), but must NOT read
-- them: leads are sales data and may contain other people's contact details.
-- No select/update/delete policies, so RLS denies those to the anon key.
-- The sales pipeline reads leads server-side with the service role.

alter table public.leads enable row level security;

drop policy if exists leads_insert_any on public.leads;
create policy leads_insert_any
  on public.leads
  for insert
  to anon, authenticated
  with check (true);


-- =============================================================================
-- End of policies.
--
-- Tables not covered here (plans, subscriptions, payments, boost_slots,
-- commission_events, premium_guides, guide_purchases, insight_access,
-- restaurant_claims, search_events, recommendations) are not part of the
-- diner-facing anon surface. If any of them are ever exposed through the
-- Supabase anon client, enable RLS and add explicit policies before doing so.
-- Until then they should remain RLS-enabled with no anon policies (deny by
-- default) and be accessed only via the service role on the server.
-- =============================================================================
