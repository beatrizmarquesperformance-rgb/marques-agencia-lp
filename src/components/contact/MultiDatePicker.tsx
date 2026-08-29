"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function fromYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function formatDatePt(s: string): string {
  return fromYmd(s).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calendar that allows selecting several dates. Selected dates are shown as
 * removable chips. No native date input, no external library.
 */
type Updater = string[] | ((prev: string[]) => string[]);

export function MultiDatePicker({
  value,
  onChange,
  id,
}: {
  value: string[];
  onChange: (next: Updater) => void;
  id?: string;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const selected = new Set(value);

  const grid = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  function toggle(d: Date) {
    const key = ymd(d);
    onChange((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key].sort(),
    );
  }
  const remove = (key: string) => onChange((prev) => prev.filter((v) => v !== key));

  const canGoPrev =
    view.getFullYear() > today.getFullYear() ||
    (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth());

  return (
    <div>
      <div
        id={id}
        className="rounded-[var(--radius)] border border-[var(--agency-line)] bg-white/[0.03] p-3"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            disabled={!canGoPrev}
            aria-label="Mês anterior"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-lg text-[var(--agency-fg)] hover:bg-white/10 disabled:opacity-30"
          >
            ‹
          </button>
          <span className="display text-sm">
            {MONTHS[view.getMonth()]} {view.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            aria-label="Mês seguinte"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius)] text-lg text-[var(--agency-fg)] hover:bg-white/10"
          >
            ›
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-[var(--agency-muted)]">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((d, i) => {
            if (!d) return <span key={i} />;
            const key = ymd(d);
            const isPast = d < today;
            const isSel = selected.has(key);
            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                aria-pressed={isSel}
                onClick={() => toggle(d)}
                className={`h-9 rounded-[var(--radius)] text-sm transition-colors ${
                  isPast
                    ? "cursor-not-allowed text-[var(--agency-line)]"
                    : isSel
                      ? "bg-[var(--agency-fg)] font-semibold text-[var(--agency-bg)]"
                      : "text-[var(--agency-fg)] hover:bg-white/10"
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {[...value].sort().map((v) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => remove(v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--agency-line)] bg-white/[0.06] px-2.5 py-1 text-xs text-[var(--agency-fg)] hover:border-[var(--danger)] hover:text-[var(--danger)]"
              >
                {formatDatePt(v)}
                <span aria-hidden="true">✕</span>
                <span className="sr-only">remover data</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
