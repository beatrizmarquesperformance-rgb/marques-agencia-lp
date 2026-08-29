"use client";

import { useEffect, useState } from "react";

interface BitEvent {
  id: string;
  datetime: string;
  title?: string;
  venue: { name?: string; city?: string; country?: string };
  offers?: { type: string; url: string }[];
  url: string;
}

type State =
  | { status: "loading" }
  | { status: "ok"; events: BitEvent[] }
  | { status: "empty" }
  | { status: "error" }
  | { status: "unconfigured" };

export function BandsintownEvents() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetch("/api/bandsintown")
      .then(async (r) => {
        if (r.status === 501) return { unconfigured: true };
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        if (data?.unconfigured) return setState({ status: "unconfigured" });
        const events: BitEvent[] = Array.isArray(data) ? data : (data.events ?? []);
        setState(events.length ? { status: "ok", events } : { status: "empty" });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="agenda"
      className="grain relative border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-5 py-20 text-[var(--agency-fg)] sm:px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <h2 className="display text-4xl sm:text-6xl">Próximos eventos</h2>

        <div className="mt-10">
          {state.status === "loading" && (
            <p className="text-[var(--agency-muted)]">A carregar…</p>
          )}
          {state.status === "error" && (
            <p className="text-[var(--agency-muted)]">
              Não foi possível carregar a agenda de momento.
            </p>
          )}
          {state.status === "empty" && (
            <p className="text-[var(--agency-muted)]">
              Sem datas anunciadas neste momento. Para reservas: 918 602 908 (Pedro Jarrais).
            </p>
          )}
          {state.status === "unconfigured" && (
            <p className="text-[var(--agency-muted)]">
              Integração Bandsintown por configurar.
            </p>
          )}
          {state.status === "ok" && (
            <ul className="divide-y divide-[var(--agency-line)]">
              {state.events.map((e) => {
                const d = new Date(e.datetime);
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-4">
                    <time
                      dateTime={e.datetime}
                      className="display w-24 shrink-0 text-lg text-[var(--agency-fg)]"
                    >
                      {d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </time>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {e.venue.name ?? e.title ?? "Evento"}
                      </span>
                      <span className="block truncate text-sm text-[var(--agency-muted)]">
                        {[e.venue.city, e.venue.country].filter(Boolean).join(", ")}
                      </span>
                    </span>
                    <a
                      href={e.offers?.[0]?.url ?? e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="display text-sm text-[var(--agency-fg)] underline underline-offset-4"
                    >
                      {e.offers?.[0]?.type === "Tickets" ? "Bilhetes" : "Detalhes"}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
