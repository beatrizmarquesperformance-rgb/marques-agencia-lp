import Image from "next/image";
import type { Project } from "@/lib/types";
import { themeVars } from "@/lib/theme";
import type { CSSProperties } from "react";
import { TornDivider } from "./TornDivider";
import { SocialLinks } from "./SocialLinks";
import { Gallery } from "./Gallery";
import { VideoRow } from "./VideoRow";
import { RevealOnScroll } from "./RevealOnScroll";
import { RequestProposalButton } from "./RequestProposalButton";

function ProjectCopy({ text }: { text: string }) {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [lead, ...body] = parts;

  return (
    <div className="max-w-[52ch]">
      <p className="display !leading-[1.05] text-[1.7rem] text-[var(--accent)] sm:text-[2.15rem]">
        {lead}
      </p>
      <div className="mt-8 space-y-6 text-[1.02rem] leading-[1.7] text-[var(--text)] sm:text-[1.15rem]">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function ProjectLogo({
  project,
  variant = "hero",
}: {
  project: Project;
  variant?: "hero" | "panel";
}) {
  const panel = variant === "panel";
  if (project.logoImage) {
    return (
      <Image
        src={project.logoImage}
        alt={`${project.name} logótipo`}
        width={520}
        height={220}
        priority={!panel}
        className={
          panel
            ? "h-auto w-[min(58vw,240px)] object-contain object-left"
            : "h-auto w-[min(78vw,520px)] object-contain"
        }
      />
    );
  }
  return (
    <span
      className={
        panel
          ? "display inline-block bg-[var(--primary)] px-3 py-1.5 text-2xl text-[var(--bg)] sm:text-3xl"
          : "display inline-block bg-[var(--primary)] px-5 py-2 text-4xl text-[var(--bg)] sm:text-6xl md:text-7xl"
      }
    >
      {project.name}
    </span>
  );
}

export function ProjectSection({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const t = project.theme;
  const priority = index === 0;
  const isSplit = Boolean(t.bgSplit && t.bgSplit !== t.bg);
  const panelBg = isSplit
    ? "linear-gradient(90deg, var(--bg) 0 50%, var(--bg-split) 50% 100%)"
    : "var(--bg)";
  const ctaStyle = {
    "--cta-fill": t.primary,
    "--cta-ink": t.bg,
  } as CSSProperties;

  if (project.comingSoon) {
    return (
      <section
        id={project.slug}
        style={themeVars(t)}
        className="grain relative flex min-h-[70vh] scroll-mt-[var(--header-h)] flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-24 text-center text-[var(--text)]"
      >
        <ProjectLogo project={project} />
        <p className="display mt-8 text-lg text-[var(--secondary)]">Em breve</p>
        <RequestProposalButton
          project={project.name}
          className="cta cta-solid mt-8"
          style={ctaStyle}
        >
          Falar sobre {project.name}
        </RequestProposalButton>
      </section>
    );
  }

  return (
    <section
      id={project.slug}
      style={themeVars(t)}
      className="relative scroll-mt-[var(--header-h)] bg-[var(--bg)] text-[var(--text)]"
      aria-label={project.name}
    >
      {/* Hero photo zone — stays put while the coloured panel rises over it */}
      <div className="sticky top-0 h-[90vh] w-full overflow-hidden">
        <div className="grain absolute inset-0">
          {project.heroImage ? (
            <Image
              src={project.heroImage}
              alt={project.heroAlt}
              fill
              priority={priority}
              sizes="100vw"
              className="object-cover object-[50%_20%]"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: isSplit
                  ? `linear-gradient(90deg, ${t.bg}, ${t.bgSplit})`
                  : `radial-gradient(120% 90% at 50% 10%, ${t.secondary}, ${t.bg})`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25" />
        </div>

        <div className="absolute inset-x-0 top-[30%] flex flex-col items-center gap-4 px-6 text-center">
          <ProjectLogo project={project} />
          {project.tagline && (
            <p className="display max-w-2xl text-sm text-white/90 drop-shadow sm:text-base">
              {project.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Coloured content panel with a torn top edge, pulled up over the hero */}
      <div className="relative z-10 -mt-[24vh]">
        {project.heroCutout && (
          <div
            className={`pointer-events-none absolute z-20 h-[clamp(320px,46vw,560px)] w-[clamp(150px,34vw,380px)] ${
              project.heroCutoutSide === "right"
                ? "right-[2%] sm:right-[5%]"
                : "left-[2%] sm:left-[5%]"
            }`}
            style={{ top: "clamp(-380px, -30vw, -180px)" }}
          >
            <Image
              src={project.heroCutout}
              alt=""
              fill
              sizes="(max-width: 640px) 40vw, 380px"
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
            />
          </div>
        )}
        <TornDivider
          color={t.bg}
          color2={isSplit ? t.bgSplit : undefined}
          seed={index + 3}
          height={100}
          className="-mb-px"
        />
        <div
          className="grain relative px-5 pb-24 pt-4 sm:px-8"
          style={{ background: panelBg }}
        >
          <div className="mx-auto max-w-[1180px]">
            {/* [ text | logo→vídeo→CTA ] — the text top lines up with the video */}
            <div className="grid gap-x-14 gap-y-6 md:grid-cols-[1fr_minmax(300px,380px)]">
              {/* row 1: logo, right column only */}
              <div className="hidden md:block" aria-hidden="true" />
              <ProjectLogo project={project} variant="panel" />

              {/* row 2 */}
              <RevealOnScroll>
                <ProjectCopy text={project.description} />
              </RevealOnScroll>

              <RevealOnScroll className="flex w-full max-w-[440px] flex-col gap-5 md:max-w-none">
                <VideoRow videos={project.videos} />
                <div className="flex flex-col gap-3">
                  <RequestProposalButton
                    project={project.name}
                    className="cta cta-solid w-full"
                    style={ctaStyle}
                  >
                    Pedir proposta para {project.name}
                  </RequestProposalButton>
                  <SocialLinks socials={project.socials} />
                  <p className="display text-sm text-[var(--secondary)]">
                    BOOKING: 918 602 908 (PEDRO JARRAIS)
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            <Gallery
              photos={project.photos}
              theme={t}
              projectName={project.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
