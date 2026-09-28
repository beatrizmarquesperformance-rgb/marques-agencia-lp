import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MEDIA_DIR = path.join(process.cwd(), "media-store");

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/** Serves images/videos uploaded via the admin (stored on local disk). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = segments.join("/");

  // reject any attempt to escape media-store (defence in depth — segments
  // come from the URL path so ".." can't survive Next's own routing, but
  // an explicit check costs nothing).
  const dest = path.join(MEDIA_DIR, key);
  if (!dest.startsWith(MEDIA_DIR + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const [data, storedType] = await Promise.all([
      readFile(dest),
      readFile(`${dest}.type`, "utf8").catch(() => null),
    ]);

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType = storedType || TYPE_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[media] serve error:", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
