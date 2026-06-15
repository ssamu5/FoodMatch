# Prisma migrations

The schema lives in `backend/prisma/schema.prisma`. There is no committed
migration history yet because the pilot has run on bundled seed data and the
optional Supabase path. Generate the first migration when you point the backend
at a real Postgres database.

## Prerequisites

- A running Postgres instance.
- `DATABASE_URL` set in `backend/.env` (see `.env.example`).

## Create the initial migration (recommended for production)

```bash
cd backend
npx prisma migrate dev --name init
```

This creates `prisma/migrations/<timestamp>_init/migration.sql`, applies it to
the database, and regenerates the Prisma Client. Commit the generated migration
folder so other environments apply the exact same SQL.

For deploying an existing migration history to staging or production:

```bash
npx prisma migrate deploy
```

## No-history alternative (fast for the pilot only)

```bash
cd backend
npx prisma db push
```

`db push` syncs the schema to the database without creating a migration file.
It is convenient for early iteration but does not give you a reproducible
history, so switch to `migrate dev` before going to production.

## Seeding

After the schema is applied:

```bash
cd backend
npm run db:seed
```

The seed (`prisma/seed.ts`) is idempotent: it upserts the three plans
(FREE, FOUNDER, PRO) and six Valencia restaurants, so it is safe to re-run.

## Keeping backends in sync

The frontend can read either the bundled seed data or a Supabase project. If you
use the Supabase path, keep the Supabase table shapes consistent with this Prisma
schema and apply the policies in `docs/SUPABASE_RLS.sql`. See
`docs/DATABASE_ARCHITECTURE.md` for the full mapping.
