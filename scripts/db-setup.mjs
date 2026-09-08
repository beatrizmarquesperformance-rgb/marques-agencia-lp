/**
 * Runs at the start of `npm run build`.
 *  - always: prisma generate
 *  - when a database URL is present (Netlify injects NETLIFY_DATABASE_URL):
 *    push the schema and upsert the baseline content from src/content/seed.ts
 *    (idempotent — admin edits are preserved).
 *  - otherwise: skip, the site renders from seed content.
 */
import { execSync } from "node:child_process";

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
