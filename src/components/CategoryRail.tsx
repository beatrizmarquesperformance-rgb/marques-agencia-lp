import type { CSSProperties } from "react";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { LazyVideo } from "./LazyVideo";
import { ScrollLink } from "./ScrollLink";

/**
 * Row of one vertical (9:16) video per project, each with a CTA that scrolls to
 * that project's section. Single row on desktop; horizontal snap-carousel on
 * tablet/mobile so the vertical format is never squashed.
 */
export function CategoryRail({ projects }: { projects: Project[] }) {
  return (
    <section
      id="categorias"
      aria-label="Projetos"
      className="grain relative scroll-mt-[var(--header-h)] border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-4 py-16 text-[var(--agency-fg)] sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2 className="display text-3xl sm:text-5xl">Os projetos</h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--agency-muted)]">
          Escolhe um projeto para ver os detalhes e pedir uma proposta.
        </p>

        <ul
          className="mt-8 grid auto-cols-[74%] grid-flow-col gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar sm:auto-cols-[42%] md:auto-cols-[30%] lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible"
        >
          {projects.map((p) => {
            const ctaStyle = {
              "--cta-fill": p.theme.primary,
              "--cta-ink": p.theme.bg,
            } as CSSProperties;
            return (
              <li key={p.slug} className="flex snap-start flex-col">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--agency-line)]">
                  {p.promoVideo.src ? (
                    <LazyVideo
                      provider={p.promoVideo.provider}
                      src={p.promoVideo.src}
                      poster={p.promoVideo.poster ?? p.heroImage}
                      mode="background"
                      label={p.name}
                      posterSizes="(max-width: 1024px) 74vw, 20vw"
                      className="h-full w-full"
                    />
                  ) : p.heroImage ? (
                    <Image
                      src={p.heroImage}
                      alt={p.heroAlt || p.name}
                      fill
                      sizes="(max-width: 1024px) 74vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(160deg, ${p.theme.secondary}, ${p.theme.bg})`,
                      }}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.75))] p-3">
                    <span className="display block text-lg leading-none text-white">
                      {p.name}
                    </span>
                    {p.comingSoon && (
                      <span className="text-[11px] uppercase tracking-wide text-white/70">
                        Em breve
                      </span>
                    )}
                  </div>
                </div>

                <ScrollLink
                  targetId={p.slug}
                  className="cta cta-solid mt-3 w-full text-[0.8rem]"
                  style={ctaStyle}
                >
                  Saber mais
                </ScrollLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
