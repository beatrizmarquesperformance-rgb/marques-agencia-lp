# Artist Agency — Landing Page

Single-page, art-directed landing page for the agency roster
(**MARQUES · PIMBA À BRUTA · FUNKISS · GANGBANGERS · ZARA G**),
plus an agenda (gigs entered by hand in `/admin`), a "Já passámos por" wall,
and a private `/admin`.

Stack: **Next.js 15 (App Router) · Tailwind v4 · Prisma + Postgres · local-disk media storage**.
Currently self-hosted on a VPS (see `docs/` if present), not Vercel/Netlify.

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

Now `/login` works and edits persist. Public pages revalidate on save.

### Agenda

Gigs are entered by hand in `/admin/agenda` — pick the project, date/time,
venue, city, an optional ticket link, and a status (confirmed/sold
out/cancelled). The public site shows every project's upcoming gigs
together, sorted by date; a gig disappears from the public list on its own
once its date has passed.

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

## Deploy

Currently self-hosted on a VPS (Node 20 + PostgreSQL + nginx + pm2), not
Vercel/Netlify. Workflow: push to `main` on GitHub → on the server,
`git pull && npm run build && pm2 restart marques-agencia-lp` (with
`DATABASE_URL`/`AUTH_SECRET`/etc. already set in the server's `.env`).
First-ever deploy needs `npm run db:push && npm run db:seed` once.

## Project map

```
src/
  app/
    page.tsx                 public landing page
    api/admin/*              login / logout / upload
    api/media/[...path]      serves admin-uploaded files (local disk, media-store/)
    admin/                   dashboard, project editor, settings, played-at, agenda
  components/                Header, ProjectSection, TornDivider, Gallery, VideoRow, Agenda, …
  content/seed.ts            built-in content (source of truth until DB is seeded)
  lib/                       content loader, prisma, auth, theme, admin actions, focus (image crop)
prisma/schema.prisma         fixed content model
```
