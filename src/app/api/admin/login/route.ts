import { NextResponse, type NextRequest } from "next/server";
import { passwordMatches, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD_HASH not set on the server." },
      { status: 501 },
    );
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
