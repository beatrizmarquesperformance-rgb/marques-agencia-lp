import type { SiteSettings } from "@/lib/types";
import { LazyVideo } from "./LazyVideo";
import { ScrollLink } from "./ScrollLink";

export function HeroVideo({ settings }: { settings: SiteSettings }) {
  return (
    <section
      id="topo"
      aria-label="Introdução"
      className="relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden bg-black text-white"
      style={{ height: "100svh" }}
    >
      <div className="absolute inset-0">
        <LazyVideo
          provider={settings.heroVideoProvider}
          src={settings.heroVideoSrc}
          poster={settings.heroVideoPoster}
          mode="background"
          label="Vídeo de apresentação"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.15)_45%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 pt-[calc(var(--header-h)+2rem)] sm:px-6 sm:pb-20">
        <h1 className="display max-w-[16ch] text-4xl sm:text-6xl md:text-7xl">
          {settings.heroHeadline}
        </h1>
        {settings.heroSubhead && (
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            {settings.heroSubhead}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <ScrollLink
            targetId="categorias"
            className="cta cta-solid"
            style={{ ["--cta-fill" as string]: "#ffffff", ["--cta-ink" as string]: "#0c0c0d" }}
          >
            Ver projetos
          </ScrollLink>
          <ScrollLink targetId="contacto" className="cta">
            Pedir proposta
          </ScrollLink>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 mx-auto mb-4 w-full max-w-[1400px] px-4 text-xs uppercase tracking-[0.2em] text-white/60 sm:px-6"
      >
        Scroll
      </div>
    </section>
  );
}
