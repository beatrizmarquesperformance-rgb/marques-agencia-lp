import Image from "next/image";
import type { PlayedAt } from "@/lib/types";
import { RevealOnScroll } from "./RevealOnScroll";

/** "Played at" — festivals, municipalities, brands. Managed in /admin. */
export function PlayedAtWall({ items }: { items: PlayedAt[] }) {
  return (
    <section
      id="played-at"
      className="grain relative border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-5 py-20 text-[var(--agency-fg)] sm:px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <h2 className="display text-4xl sm:text-6xl">Já passámos por</h2>

        {items.length === 0 ? (
          <p className="mt-8 max-w-xl text-[var(--agency-muted)]">
            Rock in Rio, RFM Somnii, Viagens de Finalistas e eventos promovidos por
            municípios de norte a sul de Portugal continental e ilhas.
            <span className="mt-2 block text-sm opacity-60">
              (Logótipos a adicionar através do /admin.)
            </span>
          </p>
        ) : (
          <RevealOnScroll className="mt-10">
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-[var(--agency-line)] sm:grid-cols-3 md:grid-cols-4">
              {items.map((it) => {
                const inner = it.logo ? (
                  <Image
                    src={it.logo}
                    alt={it.name}
                    width={180}
                    height={90}
                    loading="lazy"
                    className="max-h-12 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                  />
                ) : (
                  <span className="display text-center text-sm text-[var(--agency-muted)]">
                    {it.name}
                  </span>
                );
                return (
                  <li
                    key={it.name}
                    className="flex aspect-[2/1] items-center justify-center bg-[var(--agency-bg)] p-6"
                  >
                    {it.url ? (
                      <a href={it.url} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}
