"use client";

import { useRef, useState } from "react";
import { uploadImage, uploadVideo } from "@/lib/upload-client";

/**
 * Media picker for admin forms (single field, not a repeater row).
 * Upload a file → stored in Netlify Blobs → the URL is submitted via a hidden
 * input named `name`. Pasting a URL / ID also works.
 */
export function ImageField({
  name,
  label,
  defaultValue = "",
  hint,
  kind = "image",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  kind?: "image" | "video";
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isVideo = kind === "video";

  async function onPick(file: File) {
    setBusy(true);
    setError(null);
    try {
      setValue(isVideo ? await uploadVideo(file) : await uploadImage(file));
    } catch (e) {
      setError((e as Error).message || "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  const showsUpload = value && value.startsWith("/api/media/");

  return (
    <div className="flex flex-col gap-1 text-xs text-neutral-400 sm:col-span-2">
      <span>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {isVideo ? (
          <span className="grid h-16 w-16 shrink-0 place-items-center border border-neutral-700 text-center text-[10px] leading-tight">
            {value ? (showsUpload ? "✓ vídeo\ncarregado" : "vídeo\n(link)") : "sem vídeo"}
          </span>
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 border border-neutral-700 object-cover"
          />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center border border-dashed border-neutral-700 text-[10px]">
            sem imagem
          </span>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="border border-neutral-700 px-2 py-1 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? "A enviar…" : isVideo ? "Carregar MP4" : "Carregar ficheiro"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="px-2 py-1 text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            )}
          </div>
          <input
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isVideo ? "URL/ID ou carregar MP4" : "ou colar um URL"}
            className="w-72 max-w-full bg-neutral-950 px-2 py-1 text-sm text-white"
          />
        </div>
      </div>
      {hint && <span className="opacity-60">{hint}</span>}
      {error && <span className="text-red-400">{error}</span>}
      <input type="hidden" name={name} value={value} />
      <input
        ref={fileRef}
        type="file"
        accept={isVideo ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
