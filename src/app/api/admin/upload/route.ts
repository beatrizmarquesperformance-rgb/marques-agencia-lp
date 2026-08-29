import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";

/**
 * Client-upload token endpoint. The browser uploads the file straight to Vercel
 * Blob; this route only mints a scoped token (and never sees the file bytes).
 * Guarded by middleware (/api/admin/*) + an explicit auth check.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN not configured" },
      { status: 501 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/avif",
          "image/svg+xml",
        ],
        maximumSizeInBytes: 25 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // no-op: the client writes the returned URL into the form
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
