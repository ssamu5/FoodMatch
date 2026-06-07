-- FoodMatch schema, increment 1. Idempotent (safe to re-run).
-- Apply with: npm run db:schema  (uses the service role key)

create table if not exists public.restaurants (
  id            text primary key,
  slug          text unique not null,
  name          text not null,
  description   text not null default '',
  cuisine       text not null,
  secondary_cuisines text[] not null default '{}',
  tags          text[] not null default '{}',
  vibe          text[] not null default '{}',
  best_for      text[] not null default '{}',
  area          text not null,
  city          text not null default 'Valencia',
  address       text not null default '',
  price_level   int  not null default 2,
  average_spend int  not null default 20,
  rating        numeric(2,1) not null default 4.0,
  review_count  int  not null default 0,
  image_placeholder text not null default 'lime-muted',
  hero_image    text,
  instagram     text,
  phone         text,
  whatsapp      text,
  hours_kind    text not null default 'standard',
  vegetarian_friendly boolean not null default false,
  vegan_friendly      boolean not null default false,
  gluten_free_options boolean not null default false,
  is_partner    boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.dishes (
  id            bigint generated always as identity primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name          text not null,
  price_eur     numeric(6,2),
  tags          text[] not null default '{}',
  sort          int not null default 0
);

create table if not exists public.restaurant_claims (
  id            bigint generated always as identity primary key,
  restaurant_slug text,
  restaurant_name text not null,
  owner_name    text not null,
  email         text not null,
  phone         text,
  area          text,
  cuisine       text,
  price_band    text,
  menu_link     text,
  has_photos    boolean,
  message       text,
  source        text not null default 'assistant',
  created_at    timestamptz not null default now()
);

create index if not exists dishes_restaurant_id_idx on public.dishes(restaurant_id);
create index if not exists restaurants_cuisine_idx on public.restaurants(cuisine);
create index if not exists restaurants_area_idx on public.restaurants(area);
create index if not exists restaurants_spend_idx on public.restaurants(average_spend);
create index if not exists restaurants_sec_cuisines_idx on public.restaurants using gin(secondary_cuisines);

alter table public.restaurants       enable row level security;
alter table public.dishes            enable row level security;
alter table public.restaurant_claims enable row level security;

drop policy if exists "public read restaurants" on public.restaurants;
create policy "public read restaurants" on public.restaurants for select using (true);

drop policy if exists "public read dishes" on public.dishes;
create policy "public read dishes" on public.dishes for select using (true);

drop policy if exists "anon insert claims" on public.restaurant_claims;
create policy "anon insert claims" on public.restaurant_claims for insert with check (true);
