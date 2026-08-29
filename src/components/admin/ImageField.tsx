"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Image picker for the admin. Uploads straight to Vercel Blob when configured;
 * always allows pasting a URL as a fallback. The chosen URL is submitted via a
 * hidden input named `name`.
 */
export function ImageField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File) {
    setBusy(true);
    setError(null);
    try {
      const res = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      setValue(res.url);
    } catch (e) {
      setError((e as Error).message || "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-neutral-400 sm:col-span-2">
      <span>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
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
              {busy ? "A enviar…" : "Carregar ficheiro"}
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
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ou colar um URL"
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
        accept="image/*"
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
