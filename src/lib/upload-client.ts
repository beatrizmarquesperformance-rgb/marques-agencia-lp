"use client";

/**
 * Client-side image upload for the admin.
 * Resizes/re-encodes to webp in the browser (keeps uploads small and matches
 * the rest of the site), then POSTs to /api/admin/upload which stores it in
 * Netlify Blobs and returns a servable URL.
 */

const MAX_DIM = 2000;
const WEBP_QUALITY = 0.82;

async function toOptimisedBlob(file: File): Promise<{ blob: Blob; ext: string }> {
  // SVG and tiny files: send as-is
  if (file.type === "image/svg+xml") return { blob: file, ext: "svg" };

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { blob: file, ext: file.name.split(".").pop() || "bin" };

  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, ext: file.name.split(".").pop() || "bin" };
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  if (!blob) return { blob: file, ext: file.name.split(".").pop() || "bin" };
  return { blob, ext: "webp" };
}

/**
 * Fallback messages for failures that never reach our own route handler (so
 * there's no JSON `.error` to show) — e.g. nginx rejecting an oversized
 * request before it gets to Next.js. Every status the admin can plausibly
 * hit should read as a sentence, not a bare number.
 */
const STATUS_FALLBACK: Record<number, string> = {
  401: "A tua sessão expirou — recarrega a página, entra outra vez e tenta de novo.",
  404: "O servidor não encontrou o endereço de upload (pode estar desatualizado — recarrega a página).",
  413: "Ficheiro demasiado grande para o servidor aceitar.",
  415: "Tipo de ficheiro não suportado.",
  422: "Não foi possível processar este ficheiro — tenta converter para JPG ou PNG.",
  500: "Erro interno do servidor ao guardar o ficheiro.",
  502: "O servidor da aplicação não respondeu (pode estar a reiniciar) — espera uns segundos e tenta de novo.",
  503: "Armazenamento indisponível no servidor.",
  504: "O servidor demorou demasiado tempo a responder — tenta de novo.",
};

async function postToBlob(blob: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, filename);

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body: form });
  } catch {
    throw new Error(
      "Não foi possível contactar o servidor — verifica a tua ligação à internet e tenta de novo.",
    );
  }

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    const fallback = STATUS_FALLBACK[res.status] ?? `Falha no upload — erro inesperado do servidor (código ${res.status}).`;
    throw new Error(data.error || fallback);
  }
  return data.url;
}

export async function uploadImage(file: File): Promise<string> {
  const { blob, ext } = await toOptimisedBlob(file);
  return postToBlob(blob, `image.${ext}`);
}

/** Hosting is served through a serverless function — keep video uploads small. */
export const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

export async function uploadVideo(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `Vídeo demasiado grande (${(file.size / 1048576).toFixed(1)} MB, máx. 4 MB). ` +
        `Para vídeos maiores usa um link do YouTube/Vimeo (mete só o ID) ou pede ao programador para o alojar.`,
    );
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  return postToBlob(file, `video.${ext}`);
}
