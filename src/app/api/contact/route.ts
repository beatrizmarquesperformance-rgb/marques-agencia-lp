import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram";
import { REF_COOKIE, parseRefCookie } from "@/lib/referral";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // honeypot — pretend success, save nothing
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name, 160);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const company = str(body.company, 160);
  const project = str(body.project, 80);
  const message = str(body.message, 4000);
  const source = body.source === "page" ? "page" : "modal";
  const dates = Array.isArray(body.dates)
    ? (body.dates as unknown[])
        .filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .slice(0, 60)
    : [];

  if (!name || !EMAIL_RE.test(email) || phone.replace(/[\s()\-.]/g, "").length < 9) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  // Referral attribution — read the httpOnly cookie set by /r/{code}. Never trust the client body.
  const ref = parseRefCookie(req.cookies.get(REF_COOKIE)?.value);
  let referralId: string | null = null;
  let referralLabel: string | undefined;
  if (ref && prisma) {
    try {
      const partner = await prisma.referral.findUnique({
        where: { code: ref.c },
        select: { id: true, active: true, name: true, company: true },
      });
      if (partner?.active) {
        referralId = partner.id;
        referralLabel = partner.company
          ? `${partner.name} — ${partner.company}`
          : partner.name;
      }
    } catch (err) {
      console.error("[contact] referral lookup failed:", err);
    }
  }

  const lead = {
    name,
    email,
    phone,
    company,
    project,
    message,
    source,
    dates: JSON.stringify(dates),
    referralId,
    utmSource: ref?.s ?? null,
    utmMedium: ref?.m ?? null,
    utmCampaign: ref?.ca ?? null,
    landingPath: ref?.p ?? null,
  };

  try {
    if (prisma) {
      await prisma.lead.create({ data: lead });
    } else {
      console.info("[contact] lead (no DB):", { ...lead, referralCode: ref?.c });
    }
  } catch (err) {
    console.error("[contact] failed to store lead:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Notify Telegram — awaited so serverless doesn't kill it, but never fatal.
  await notifyTelegram({ name, email, phone, company, project, message, source, dates, referralLabel });

  return NextResponse.json({ ok: true });
}
