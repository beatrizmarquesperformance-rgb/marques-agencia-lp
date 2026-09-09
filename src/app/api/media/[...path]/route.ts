import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Serves images uploaded via the admin (stored in Netlify Blobs). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = path.join("/");

  try {
    const store = getStore({ name: "media", consistency: "strong" });
    const res = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!res) return new NextResponse("Not found", { status: 404 });

    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      (res.metadata?.contentType as string) || TYPE_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(res.data, {
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
