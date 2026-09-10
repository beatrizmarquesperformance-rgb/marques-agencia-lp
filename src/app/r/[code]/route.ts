import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  REF_COOKIE,
  REF_COOKIE_MAX_AGE,
  isValidReferralCode,
  serializeRefCookie,
} from "@/lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only same-origin absolute paths are allowed as a redirect target. */
function safePath(to: string | null): string {
  if (!to) return "/";
  if (!to.startsWith("/") || to.startsWith("//")) return "/";
  return to.slice(0, 300);
}

/**
 * Referral link. Visiting `/r/{code}`:
 *  1. looks the partner up,
 *  2. records the visit (best-effort),
 *  3. drops the `mq_ref` cookie (httpOnly, 30 days, last-touch),
 *  4. redirects to the landing page.
 *
 * Invalid / inactive / unknown codes get the SAME redirect with no cookie
 * change, so the endpoint is not an enumeration oracle.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw ?? "").trim().toLowerCase();

  const url = req.nextUrl;
  const to = safePath(url.searchParams.get("to"));
  const utmSource = url.searchParams.get("utm_source");
  const utmMedium = url.searchParams.get("utm_medium");
  const utmCampaign = url.searchParams.get("utm_campaign");

  const dest = new URL(to, url.origin);
  for (const [k, v] of Object.entries({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  })) {
    if (v) dest.searchParams.set(k, v);
  }
  const res = NextResponse.redirect(dest, 302);

  if (!prisma || !isValidReferralCode(code)) return res;

  let referral: { id: string; active: boolean } | null = null;
  try {
    referral = await prisma.referral.findUnique({
      where: { code },
      select: { id: true, active: true },
    });
  } catch (err) {
    console.error("[/r] lookup failed:", err);
    return res;
  }
  if (!referral || !referral.active) return res;

  try {
    await prisma.referralVisit.create({
      data: {
        referralId: referral.id,
        path: to,
        utmSource: utmSource ?? undefined,
        utmMedium: utmMedium ?? undefined,
        utmCampaign: utmCampaign ?? undefined,
        referer: req.headers.get("referer")?.slice(0, 300) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[/r] visit log failed:", err);
  }

  res.cookies.set(REF_COOKIE, serializeRefCookie({
    code,
    utmSource,
    utmMedium,
    utmCampaign,
    path: to,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REF_COOKIE_MAX_AGE,
  });

  return res;
}
