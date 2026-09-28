/**
 * Runs at the start of `npm run build`.
 *  - always: prisma generate
 *  - when a database URL is present (Netlify injects NETLIFY_DATABASE_URL;
 *    self-hosted servers set DATABASE_URL in a local .env file instead) —
 *    push the schema and upsert the baseline content from src/content/seed.ts
 *    (idempotent — admin edits are preserved).
 *  - otherwise: skip, the site renders from seed content.
 */
import { execSync } from "node:child_process";
import path from "node:path";

// Plain `node` scripts don't auto-load .env — only Next's own CLI (next build/
// dev/start) and the Prisma CLI do that for themselves. Without this, a
// self-hosted server with DATABASE_URL only in .env (no real env var exported
// by the shell/process manager) would silently skip the push+seed below on
// every build. Node 20.6+ has this built in; harmless no-op if the file is
// missing (e.g. Netlify, which injects real env vars instead of a .env file).
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // no .env file — fine, rely on real process env vars (e.g. Netlify)
}

const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

run("prisma generate");

if (!url) {
  console.log("[db-setup] no database URL — running from seed content");
  process.exit(0);
}

console.log("[db-setup] syncing schema + baseline content to the database");
run("prisma db push --skip-generate");
run("tsx prisma/seed.ts");
