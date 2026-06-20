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
