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

export async function uploadImage(file: File): Promise<string> {
  const { blob, ext } = await toOptimisedBlob(file);

  const form = new FormData();
  form.append("file", blob, `image.${ext}`);

  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!res.ok || !data.url) {
    throw new Error(data.error || `Falha no upload (${res.status})`);
  }
  return data.url;
}
