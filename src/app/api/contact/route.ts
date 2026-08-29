import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

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

  const lead = { name, email, phone, project, message, source, dates: JSON.stringify(dates) };

  try {
    if (prisma) {
      await prisma.lead.create({ data: lead });
    } else {
      console.info("[contact] lead (no DB):", lead);
    }
  } catch (err) {
    console.error("[contact] failed to store lead:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
