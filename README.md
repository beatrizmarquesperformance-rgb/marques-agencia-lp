# Artist Agency — Landing Page

Single-page, art-directed landing page for the agency roster
(**MARQUES · PIMBA À BRUTA · FUNKISS · GANGBANGERS · ZARA G**),
plus a Bandsintown agenda, a "Já passámos por" wall, and a private `/admin`.

Stack: **Next.js 15 (App Router) · Tailwind v4 · Prisma + Postgres · Vercel Blob (media) · deploy to Vercel**.

---

## Run locally

```bash
npm install
cp .env.example .env      # fill in as needed — the site runs with an EMPTY .env
npm run dev               # http://localhost:3000
```

With no `DATABASE_URL`, the site renders from `src/content/seed.ts` (all brief copy,
themed placeholders for every missing image/video). `/admin` is explorable but won't save.

### Enable the database + admin

```bash
# 1. a Postgres URL (Vercel Postgres, Neon, local…)
echo 'DATABASE_URL="postgres://…"' >> .env

# 2. admin password
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
# → paste as ADMIN_PASSWORD_HASH in .env
echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env

# 3. create tables + load the seed content
npm run db:push
npm run db:seed
```

Now `/admin/login` works and edits persist. Public pages revalidate on save.

### Bandsintown

Set `BANDSINTOWN_APP_ID` (server secret) and the artist via `BANDSINTOWN_ARTIST`
or `/admin → Definições`. Until both exist the agenda shows a neutral "por configurar" state.

---

## Where the real assets go

Drop the four Dropbox folders into `assets-src/` (git-ignored) so we can optimise
and upload them:

```
assets-src/
  marques/      (Fotos Press Kit, Logo Marques [.svg], Aftermovies)
  pimba/        (Fotos Cartaz, Logotipo, Aftermovie.mp4)
  funkiss/      (Presskit fotos, Logo Kisscam, Aftermovies)   ← see note
  gangbangers/  (Logotipo, Aftermovie, Shorts)                ← no photos supplied
```

In `/admin`, upload with the "Carregar ficheiro" buttons (stored in Netlify
Blobs, served from `/api/media/...`) or paste an external URL.

### Known asset gaps (from inspection)

| Project | Gap |
|---|---|
| GANGBANGERS | **0 photos** in Dropbox (only logo + videos) |
| FUNKISS | only 3 photos; **no usable logo** — Dropbox lockup is marked *"NÃO USAR"*. Currently a typographic placeholder. |
| Videos | all raw 50–380 MB — need compression or a host (Mux / Cloudflare Stream) before going live |

---

## Content rules (do not break)

- MARQUES / PIMBA / FUNKISS / GANGBANGERS body copy is **verbatim** from the brief.
- ZARA G: structure only, `comingSoon`, no invented content.
- No invented social URLs, festival names, or logos.

---

## Deploy (Vercel)

1. Push repo → import in Vercel.
2. Add Vercel Postgres + Vercel Blob from the dashboard (env vars auto-injected).
3. Add `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `BANDSINTOWN_APP_ID`, `NEXT_PUBLIC_SITE_URL`.
4. First deploy: run `npm run db:push && npm run db:seed` once (locally against the prod URL, or a one-off script).

## Project map

```
src/
  app/
    page.tsx                 public landing page
    api/bandsintown/route.ts server-side BIT proxy (app_id stays secret)
    api/admin/*              login / logout
    admin/                   dashboard, project editor, settings, played-at
  components/                Header, ProjectSection, TornDivider, Gallery, VideoRow, …
  content/seed.ts            built-in content (source of truth until DB is seeded)
  lib/                       content loader, prisma, auth, theme, admin actions
prisma/schema.prisma         fixed content model
```
