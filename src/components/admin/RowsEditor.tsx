"use client";

import { useRef, useState } from "react";
import { uploadImage, uploadVideo } from "@/lib/upload-client";
import { useUploadGuard } from "./UploadGuard";
import { FocusEditor } from "./FocusEditor";
import { VIDEO_PROVIDER_ADMIN_INFO } from "@/lib/video";
import type { VideoProvider } from "@/lib/types";

export interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "url" | "select" | "image" | "video" | "datetime";
  options?: string[];
  /** Display label per option value, when the value itself isn't human-friendly
   * (e.g. a project slug). Falls back to the raw value when not given. */
  optionLabels?: Record<string, string>;
  placeholder?: string;
  wide?: boolean;
  /** For type "image": name of the sibling field in the same row that holds
   * the "x,y,zoom" focal point — shows a drag/zoom editor once an image is set. */
  focusField?: string;
  /** Aspect ratio (CSS value, e.g. "3 / 4") the focus editor preview should use. */
  focusAspect?: string;
  /** For type "video": name of the sibling field holding the provider
   * (mp4/youtube/vimeo/mux/cloudflare) — swaps the label/placeholder and
   * hides the upload button for providers that take an ID, not a file. */
  providerField?: string;
}

type Row = Record<string, string>;

/**
 * Generic add/remove/reorder repeater. Submits plain form fields (repeated
 * names) to a server action — no client state reaches the server directly.
 */
export function RowsEditor({
  action,
  fields,
  initial,
  addLabel = "Adicionar",
  saved,
}: {
  action: (fd: FormData) => void | Promise<void>;
  fields: FieldSpec[];
  initial: Row[];
  addLabel?: string;
  saved?: boolean;
}) {
  const empty: Row = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const [rows, setRows] = useState<Row[]>(initial.length ? initial : []);

  const update = (i: number, key: string, value: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const rowLabel = addLabel.charAt(0).toUpperCase() + addLabel.slice(1);

  return (
    <form action={action} noValidate className="space-y-3">
      {saved && <p className="text-sm text-green-400">Guardado.</p>}
      {rows.map((row, i) => (
        <div key={i} className="border border-neutral-800 bg-neutral-900/50 p-3">
          <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {rowLabel} {i + 1}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => move(i, -1)}
                title="Mover para cima"
                className="text-neutral-500 hover:text-white disabled:opacity-30"
                disabled={i === 0}
              >
                ↑ subir
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                title="Mover para baixo"
                className="text-neutral-500 hover:text-white disabled:opacity-30"
                disabled={i === rows.length - 1}
              >
                ↓ descer
              </button>
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-300"
              >
                ✕ remover
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => {
            const providerInfo =
              f.type === "video" && f.providerField
                ? VIDEO_PROVIDER_ADMIN_INFO[row[f.providerField] as VideoProvider]
                : undefined;
            return (
            <label
              key={f.name}
              className={`flex flex-col text-xs text-neutral-400 ${f.wide ? "sm:col-span-2" : ""}`}
            >
              {providerInfo?.label ?? f.label}
              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={row[f.name] ?? ""}
                  onChange={(e) => update(i, f.name, e.target.value)}
                  className="mt-0.5 bg-neutral-950 px-2 py-1 text-sm text-white"
                >
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {f.optionLabels?.[o] ?? o}
                    </option>
                  ))}
                </select>
              ) : f.type === "datetime" ? (
                <input
                  name={f.name}
                  type="datetime-local"
                  value={row[f.name] ?? ""}
                  onChange={(e) => update(i, f.name, e.target.value)}
                  className="mt-0.5 bg-neutral-950 px-2 py-1 text-sm text-white [color-scheme:dark]"
                />
              ) : f.type === "image" || f.type === "video" ? (
                <MediaInput
                  kind={f.type}
                  name={f.name}
                  value={row[f.name] ?? ""}
                  onChange={(v) => update(i, f.name, v)}
                  focusName={f.focusField}
                  focusDefaultValue={f.focusField ? row[f.focusField] : undefined}
                  focusAspect={f.focusAspect}
                  uploadEnabled={providerInfo?.upload}
                  placeholder={providerInfo?.placeholder}
                />
              ) : (
                <input
                  name={f.name}
                  type="text"
                  inputMode={f.type === "url" ? "url" : "text"}
                  value={row[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => update(i, f.name, e.target.value)}
                  className="mt-0.5 bg-neutral-950 px-2 py-1 text-sm text-white"
                />
              )}
            </label>
            );
          })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { ...empty }])}
          className="border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
        >
          + {addLabel}
        </button>
        <button
          type="submit"
          className="bg-white px-4 py-1.5 text-sm font-medium text-black"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

function MediaInput({
  kind,
  name,
  value,
  onChange,
  focusName,
  focusDefaultValue,
  focusAspect,
  uploadEnabled,
  placeholder,
}: {
  kind: "image" | "video";
  name: string;
  value: string;
  onChange: (v: string) => void;
  focusName?: string;
  focusDefaultValue?: string;
  focusAspect?: string;
  /** Set to false for video providers that take an ID, not a file
   * (youtube/vimeo/mux/cloudflare) — hides the upload button entirely. */
  uploadEnabled?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const guard = useUploadGuard();
  const canUpload = uploadEnabled ?? true;

  async function send(file: File) {
    setBusy(true);
    guard.begin();
    try {
      onChange(kind === "video" ? await uploadVideo(file) : await uploadImage(file));
    } catch (e) {
      alert((e as Error).message || "Falha no upload.");
    } finally {
      guard.end();
      setBusy(false);
    }
  }

  const showsFocusEditor = kind === "image" && focusName && value;

  return (
    <span className="mt-0.5 flex flex-col gap-2">
      <span className="flex items-center gap-2">
        {value && kind === "image" && !showsFocusEditor ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-9 w-9 border border-neutral-700 object-cover" />
        ) : null}
        <input
          name={name}
          type="text"
          inputMode="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (kind === "video" ? "URL/ID ou carregar MP4 →" : "URL ou carregar →")}
          className="w-full bg-neutral-950 px-2 py-1 text-sm text-white"
        />
        {canUpload && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="shrink-0 border border-neutral-700 px-2 py-1 text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? "…" : "⬆︎"}
          </button>
        )}
      </span>
      {showsFocusEditor && (
        <FocusEditor
          name={focusName}
          imageUrl={value}
          defaultValue={focusDefaultValue}
          aspect={focusAspect}
        />
      )}
      {canUpload && (
      <input
        ref={ref}
        type="file"
        accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) send(f);
          e.target.value = "";
        }}
      />
      )}
    </span>
  );
}
