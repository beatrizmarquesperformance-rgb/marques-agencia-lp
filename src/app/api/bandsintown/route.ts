import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";

export const revalidate = 3600; // cache upstream for 1h

/**
 * Server-side proxy so BANDSINTOWN_APP_ID never reaches the client.
 * Returns 501 when unconfigured so the UI can show a neutral state.
 */
export async function GET() {
  const appId = process.env.BANDSINTOWN_APP_ID;
  const { settings } = await getContent();
  const artist =
    process.env.BANDSINTOWN_ARTIST || settings.bandsintownArtist || "";

  if (!appId || !artist) {
    return NextResponse.json({ error: "unconfigured" }, { status: 501 });
  }

  const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(
    artist,
  )}/events?app_id=${encodeURIComponent(appId)}&date=upcoming`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream", status: res.status }, { status: 502 });
    }
    const data = await res.json();
    const events = Array.isArray(data) ? data : [];
    return NextResponse.json(
      { events },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
