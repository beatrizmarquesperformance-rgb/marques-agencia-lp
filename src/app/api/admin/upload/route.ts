import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@netlify/blobs";
import { isAuthed } from "@/lib/auth";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const ALLOWED = new Set(Object.keys(EXT));
const MAX_BYTES = 8 * 1024 * 1024;

const extFor = (type: string): string => EXT[type] || "bin";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    /* ignore */
  }
  if (!file) {
    return NextResponse.json({ error: "Nenhum ficheiro recebido." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Tipo não permitido: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 8 MB)." }, { status: 413 });
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const key = `uploads/${stamp}-${crypto.randomUUID().slice(0, 8)}.${extFor(file.type)}`;

  try {
    const store = getStore({ name: "media", consistency: "strong" });
    await store.set(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type },
    });
  } catch (err) {
    console.error("[upload] blob store error:", err);
    return NextResponse.json(
      {
        error:
          "Armazenamento de imagens indisponível. Em desenvolvimento local, cola um URL. Em produção, verifica os Netlify Blobs.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ url: `/api/media/${key}` });
}
