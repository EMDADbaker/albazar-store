# ALBAZAR — Database region move (the real speed fix)

## Why
The Supabase DB is in **`ap-southeast-2` (Sydney)**. Customers are in **Saudi Arabia**.
Every uncached query pays a ~300ms+ round-trip to the other side of the planet.
Measured locally (`npm start`): static pages 0.14s, but any **cold** DB page spiked
to **1.6–4.3s** — that spike is the Sydney trip. Moving the DB near KSA cuts it to ~30–60ms.

> Supabase **cannot change a project's region in place.** You create a new project in
> the target region and migrate data into it.

## Target region
Pick the closest Supabase region to KSA (best → acceptable):
1. **`eu-central-1` (Frankfurt)** — recommended. ~80–120ms to KSA, well-supported.
2. `ap-south-1` (Mumbai) — also close.
3. `me-central-1` (UAE) *if offered in your Supabase plan* — closest of all.

Avoid London/US/Sydney for a KSA audience.

## Migration steps

### 1. Create the new project
- Supabase dashboard → New project → choose the target region above.
- Wait for it to provision. Note the new project ref.

### 2. Dump the current (Sydney) database
Use the **DIRECT** connection string (not the pooler) for dump/restore.
```bash
# from the old project's Connection settings → "Direct connection"
pg_dump "postgresql://postgres:<OLD_PW>@db.<OLD_REF>.supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists -Fc -f albazar.dump
```

### 3. Restore into the new project
```bash
pg_restore --no-owner --no-privileges \
  -d "postgresql://postgres:<NEW_PW>@db.<NEW_REF>.supabase.co:5432/postgres" \
  albazar.dump
```
(If `pg_restore` complains about extensions, run `prisma migrate deploy` against the new
DIRECT_URL first to create the schema, then restore **data only** with `--data-only`.)

### 4. Point the app at the new project
Update **both** the pooled and direct URLs everywhere they live:
- Local `.env`:
  - `DATABASE_URL` → new **pooler** URL (`...pooler.supabase.com:6543/postgres?pgbouncer=true`)
  - `DIRECT_URL` → new **direct** URL (`db.<NEW_REF>.supabase.co:5432`)
- Host env vars (Netlify/Vercel dashboard) → same two values.

### 5. Verify
```bash
npx prisma migrate status      # should be up to date
npx prisma studio              # confirm products/drops/users are present
npm run build                  # prebuilds against the new DB
```
Then re-run the timing check: `npm start`, and curl a product page twice — the **cold**
number should drop from ~3s to well under 1s.

### 6. Rotate credentials
The old Supabase password was shared in chat — once the new project is live and verified,
**delete the old project** (or at least rotate its password) so the leaked one is dead.

## Hosting note (optional but ideal)
Netlify Functions run in **us-east-1** by default and the region isn't freely configurable.
For true co-location with a Frankfurt DB:
- **Option A (best):** deploy on **Vercel** with function region `fra1` (Frankfurt). App-Router
  native, lets you pin the region next to Supabase → DB hops ~5–20ms, users ~80–120ms.
- **Option B:** stay on Netlify; moving just the DB to Frankfurt still helps a lot
  (US↔Frankfurt ~90ms beats US↔Sydney ~200ms), but you keep the US middle-hop.

## What the code changes already bought you
- Public pages (home, shop, product, category, brand, drop) now serve as **static/ISR** with
  **no per-request session read** — anonymous browsing largely avoids the DB entirely.
- `loading.tsx` skeletons make taps feel instant even on a cold segment.
- So after the region move, the few DB hits that remain (checkout, account, cache refresh)
  are also fast — and most browsing never waits on the DB at all.
```
