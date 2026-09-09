import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@netlify/blobs";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_BYTES = 8 * 1024 * 1024;

function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

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
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 8 MB)." }, { status: 413 });
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/") || file.type === "";
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: `Tipo não suportado: ${file.type}` }, { status: 415 });
  }
  if (isVideo && !VIDEO_EXT[file.type]) {
    return NextResponse.json({ error: `Formato de vídeo não suportado: ${file.type}` }, { status: 415 });
  }

  let data: ArrayBuffer = await file.arrayBuffer();
  let ext = isVideo ? VIDEO_EXT[file.type] : "bin";
  let contentType = file.type || "application/octet-stream";

  if (isImage && file.type !== "image/svg+xml") {
    // Normalise any image (incl. HEIC/TIFF/huge PNGs) to a clean web webp.
    try {
      const sharp = (await import("sharp")).default;
      const out = await sharp(Buffer.from(data), { failOn: "none" })
        .rotate()
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      data = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
      ext = "webp";
      contentType = "image/webp";
    } catch (err) {
      console.error("[upload] sharp normalise failed, storing as-is:", err);
      // fall back: only keep it if it's a browser-displayable format
      const okExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
      };
      if (!okExt[file.type]) {
        return NextResponse.json(
          { error: `Não foi possível processar a imagem (${file.type}). Converte para JPG ou PNG e tenta de novo.` },
          { status: 422 },
        );
      }
      ext = okExt[file.type];
    }
  } else if (file.type === "image/svg+xml") {
    ext = "svg";
  }

  const key = `uploads/${stamp()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    const store = getStore({ name: "media", consistency: "strong" });
    await store.set(key, data, { metadata: { contentType } });
  } catch (err) {
    console.error("[upload] blob store error:", err);
    return NextResponse.json(
      { error: "Armazenamento indisponível. Em local, cola um URL; em produção verifica os Netlify Blobs." },
      { status: 503 },
    );
  }

  return NextResponse.json({ url: `/api/media/${key}` });
}
