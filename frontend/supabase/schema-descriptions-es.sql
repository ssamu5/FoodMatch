-- FoodMatch schema, increment 5: bilingual restaurant descriptions.
-- Idempotent (safe to re-run). Apply by pasting into the Supabase SQL editor.
--
-- Adds an OPTIONAL Spanish description column. The app reads it through
-- rowToRestaurant (Restaurant.descriptionEs) and prefers it over the
-- client-side fallback map in src/lib/descriptions.ts. Nothing breaks before
-- this runs: with the column absent, rows simply have no description_es and the
-- app falls back to the translation map, then to the English text.
--
-- After applying, optionally backfill the demo data with:
--   node scripts/populateDescriptionsEs.mjs   (needs SUPABASE_SERVICE_ROLE_KEY)

alter table public.restaurants add column if not exists description_es text;

-- Extend the owner self-edit function to also set the Spanish description. The
-- signature changes (adds p_description_es), so drop the old 7-arg version first,
-- then recreate. Still SECURITY DEFINER, search_path pinned, content-fields only:
-- is_partner and owner_id remain untouchable by owners.
drop function if exists public.update_my_restaurant(text, text, text, text, text, text, text);

create or replace function public.update_my_restaurant(
  p_slug text,
  p_name text,
  p_description text,
  p_description_es text,
  p_address text,
  p_phone text,
  p_instagram text,
  p_whatsapp text
)
returns public.restaurants
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.restaurants;
begin
  update public.restaurants
     set name           = coalesce(p_name, name),
         description    = coalesce(p_description, description),
         description_es = coalesce(p_description_es, description_es),
         address        = coalesce(p_address, address),
         phone          = p_phone,
         instagram      = p_instagram,
         whatsapp       = p_whatsapp
   where slug = p_slug
     and owner_id = auth.uid()
     and auth.uid() is not null
  returning * into r;

  if r.id is null then
    raise exception 'not your restaurant or not signed in';
  end if;
  return r;
end;
$$;

revoke all on function public.update_my_restaurant(text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_restaurant(text, text, text, text, text, text, text, text) to authenticated;
