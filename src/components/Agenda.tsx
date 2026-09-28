import type { Gig } from "@/lib/types";

const STATUS_LABEL: Record<Gig["status"], string> = {
  CONFIRMED: "",
  SOLD_OUT: "Esgotado",
  CANCELLED: "Cancelado",
};

/**
 * Site-wide agenda — every project's gigs together, ordered by date. Data is
 * entered by hand in /admin/agenda (no external service). Only upcoming
 * dates reach here (filtered server-side in getContent()).
 */
export function Agenda({ gigs }: { gigs: Gig[] }) {
  return (
    <section
      id="agenda"
      className="grain relative border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-5 py-20 text-[var(--agency-fg)] sm:px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <h2 className="display text-4xl sm:text-6xl">Próximos eventos</h2>

        <div className="mt-10">
          {gigs.length === 0 ? (
            <p className="text-[var(--agency-muted)]">
              Sem datas anunciadas neste momento. Para reservas: 918 602 908 (Pedro Jarrais).
            </p>
          ) : (
            <ul className="divide-y divide-[var(--agency-line)]">
              {gigs.map((g) => {
                const d = new Date(g.date);
                const cancelled = g.status === "CANCELLED";
                const statusLabel = STATUS_LABEL[g.status];
                return (
                  <li
                    key={g.id}
                    className={`flex flex-wrap items-center gap-x-6 gap-y-1 py-4 ${
                      cancelled ? "opacity-50" : ""
                    }`}
                  >
                    <time
                      dateTime={g.date}
                      className="display w-24 shrink-0 text-lg text-[var(--agency-fg)]"
                    >
                      {d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </time>
                    <span
                      className="w-2 h-2 shrink-0 rounded-full"
                      style={{ background: g.projectColor }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {g.venue}
                        <span className="ml-2 text-xs font-normal text-[var(--agency-muted)]">
                          {g.projectName}
                        </span>
                      </span>
                      <span className="block truncate text-sm text-[var(--agency-muted)]">
                        {[g.city, d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    {statusLabel ? (
                      <span className="display text-sm text-[var(--agency-muted)]">
                        {statusLabel}
                      </span>
                    ) : g.ticketUrl ? (
                      <a
                        href={g.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="display text-sm text-[var(--agency-fg)] underline underline-offset-4"
                      >
                        Bilhetes
                      </a>
                    ) : null}
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
