"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "url" | "select" | "image";
  options?: string[];
  placeholder?: string;
  wide?: boolean;
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

  return (
    <form action={action} className="space-y-3">
      {saved && <p className="text-sm text-green-400">Guardado.</p>}
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-2 border border-neutral-800 bg-neutral-900/50 p-2"
        >
          {fields.map((f) => (
            <label
              key={f.name}
              className={`flex flex-col text-xs text-neutral-400 ${f.wide ? "min-w-[16rem] flex-1" : "w-40"}`}
            >
              {f.label}
              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={row[f.name] ?? ""}
                  onChange={(e) => update(i, f.name, e.target.value)}
                  className="mt-0.5 bg-neutral-950 px-2 py-1 text-sm text-white"
                >
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "image" ? (
                <ImageInput
                  name={f.name}
                  value={row[f.name] ?? ""}
                  onChange={(v) => update(i, f.name, v)}
                />
              ) : (
                <input
                  name={f.name}
                  type={f.type === "url" ? "url" : "text"}
                  value={row[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => update(i, f.name, e.target.value)}
                  className="mt-0.5 bg-neutral-950 px-2 py-1 text-sm text-white"
                />
              )}
            </label>
          ))}
          <div className="flex gap-1">
            <button type="button" onClick={() => move(i, -1)} className="px-2 text-neutral-500 hover:text-white">
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)} className="px-2 text-neutral-500 hover:text-white">
              ↓
            </button>
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
              className="px-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
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

function ImageInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function send(file: File) {
    setBusy(true);
    try {
      const res = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onChange(res.url);
    } catch (e) {
      alert((e as Error).message || "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="mt-0.5 flex items-center gap-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-9 w-9 border border-neutral-700 object-cover" />
      ) : null}
      <input
        name={name}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL ou carregar →"
        className="w-full bg-neutral-950 px-2 py-1 text-sm text-white"
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="shrink-0 border border-neutral-700 px-2 py-1 text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {busy ? "…" : "⬆︎"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) send(f);
          e.target.value = "";
        }}
      />
    </span>
  );
}
