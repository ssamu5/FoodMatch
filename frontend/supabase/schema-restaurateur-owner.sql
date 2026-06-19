-- FoodMatch schema, increment 4: restaurateur self-service ownership + editing.
-- Idempotent. Apply AFTER schema-restaurateur.sql by pasting into the Supabase SQL editor.
--
-- Owners act through these SECURITY DEFINER functions, NOT through direct table
-- UPDATE, so they can only ever change content fields. is_partner and owner_id
-- stay admin-only (set via the admin flow / service role). search_path is pinned
-- for safety.

-- Claim an unowned restaurant as the current signed-in user.
create or replace function public.claim_restaurant(p_slug text)
returns public.restaurants
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.restaurants;
begin
  update public.restaurants
     set owner_id = auth.uid()
   where slug = p_slug
     and owner_id is null
     and auth.uid() is not null
  returning * into r;

  if r.id is null then
    raise exception 'restaurant not found, already owned, or not signed in';
  end if;
  return r;
end;
$$;

revoke all on function public.claim_restaurant(text) from public;
grant execute on function public.claim_restaurant(text) to authenticated;

-- Edit the CONTENT fields of a restaurant you own. Never touches is_partner/owner_id.
create or replace function public.update_my_restaurant(
  p_slug text,
  p_name text,
  p_description text,
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
     set name        = coalesce(p_name, name),
         description = coalesce(p_description, description),
         address     = coalesce(p_address, address),
         phone       = p_phone,
         instagram   = p_instagram,
         whatsapp    = p_whatsapp
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

revoke all on function public.update_my_restaurant(text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_restaurant(text, text, text, text, text, text, text) to authenticated;
