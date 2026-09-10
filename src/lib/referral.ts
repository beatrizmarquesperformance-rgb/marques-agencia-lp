import "server-only";

/**
 * Referral attribution helpers.
 *
 * A partner ("referral") shares a link `/r/{code}`. Visiting it drops an
 * httpOnly cookie; when the visitor later submits the lead form, the API
 * route reads that cookie server-side and attaches `referralId` to the Lead.
 * The client never sends the referral — it can't read the cookie either.
 *
 * Attribution model: LAST-TOUCH. Every visit to a valid+active `/r/{code}`
 * overwrites the cookie. See the plan / README for the rationale.
 */

export const REF_COOKIE = "mq_ref";
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/** Compact payload stored in the cookie (kept short to stay well under limits). */
export interface RefCookie {
  /** referral code */
  c: string;
  /** utm_source */
  s?: string;
  /** utm_medium */
  m?: string;
  /** utm_campaign */
  ca?: string;
  /** landing path */
  p?: string;
  /** unix seconds when the touch happened */
  t: number;
}

export function serializeRefCookie(input: {
  code: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  path?: string | null;
}): string {
  const payload: RefCookie = { c: input.code, t: Math.floor(Date.now() / 1000) };
  if (input.utmSource) payload.s = input.utmSource.slice(0, 120);
  if (input.utmMedium) payload.m = input.utmMedium.slice(0, 120);
  if (input.utmCampaign) payload.ca = input.utmCampaign.slice(0, 120);
  if (input.path) payload.p = input.path.slice(0, 300);
  return JSON.stringify(payload);
}

/** Tolerant parser — returns null for missing / malformed / codeless cookies. */
export function parseRefCookie(value: string | undefined | null): RefCookie | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(value) as unknown;
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const c = typeof o.c === "string" ? o.c.trim().toLowerCase() : "";
    if (!c || !isValidReferralCode(c)) return null;
    return {
      c,
      s: typeof o.s === "string" ? o.s : undefined,
      m: typeof o.m === "string" ? o.m : undefined,
      ca: typeof o.ca === "string" ? o.ca : undefined,
      p: typeof o.p === "string" ? o.p : undefined,
      t: typeof o.t === "number" ? o.t : 0,
    };
  } catch {
    return null;
  }
}

/** Referral codes: lowercase letters/digits and single hyphens, 3–40 chars. */
export function isValidReferralCode(code: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) && code.length >= 3 && code.length <= 40;
}

/** Strip accents + non-alphanumerics; keep the first meaningful word. */
export function slugifyName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
  const first = cleaned.split(/\s+/).filter(Boolean)[0] ?? "";
  return first.slice(0, 16) || "ref";
}

// No 0/o/1/l — easier to read/dictate over the phone.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function randomSuffix(len = 4): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Build a unique referral code `${slug}-${rand4}`. `exists` checks the DB;
 * we retry a handful of times, then fall back to a longer random tail.
 * The `@unique` constraint on Referral.code is the final guarantee.
 */
export async function generateReferralCode(
  name: string,
  exists: (code: string) => Promise<boolean>,
): Promise<string> {
  const slug = slugifyName(name);
  for (let i = 0; i < 6; i++) {
    const code = `${slug}-${randomSuffix(4)}`;
    if (!(await exists(code))) return code;
  }
  for (let i = 0; i < 5; i++) {
    const code = `${slug}-${randomSuffix(8)}`;
    if (!(await exists(code))) return code;
  }
  return `${slug}-${randomSuffix(12)}`;
}

/** Absolute URL shown in the backoffice for copy/paste. */
export function referralUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return `${base}/r/${code}`;
}
