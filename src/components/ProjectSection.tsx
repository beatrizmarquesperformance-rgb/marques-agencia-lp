import Image from "next/image";
import type { Project } from "@/lib/types";
import { themeVars } from "@/lib/theme";
import { TornDivider } from "./TornDivider";
import { SocialLinks } from "./SocialLinks";
import { Gallery } from "./Gallery";
import { VideoRow } from "./VideoRow";
import { RevealOnScroll } from "./RevealOnScroll";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "display text-xl text-[var(--accent)] sm:text-2xl"
                : "display text-[15px] leading-tight sm:text-base"
            }
          >
            {p}
          </p>
        ))}
    </>
  );
}

function ProjectLogo({ project }: { project: Project }) {
  if (project.logoImage) {
    return (
      <Image
        src={project.logoImage}
        alt={`${project.name} logótipo`}
        width={520}
        height={220}
        priority
        className="h-auto w-[min(78vw,520px)] object-contain"
      />
    );
  }
  return (
    <span className="display inline-block bg-[var(--primary)] px-5 py-2 text-4xl text-[var(--bg)] sm:text-6xl md:text-7xl">
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

  if (project.comingSoon) {
    return (
      <section
        id={project.slug}
        style={themeVars(t)}
        className="grain relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-24 text-center text-[var(--text)]"
      >
        <ProjectLogo project={project} />
        <p className="display mt-8 text-lg text-[var(--secondary)]">Em breve</p>
      </section>
    );
  }

  return (
    <section
      id={project.slug}
      style={themeVars(t)}
      className="relative bg-[var(--bg)] text-[var(--text)]"
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
              className="object-cover"
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
            <div className="grid gap-8 md:grid-cols-2 md:gap-14">
              <RevealOnScroll className="space-y-4">
                <Paragraphs text={project.description} />
              </RevealOnScroll>

              <RevealOnScroll className="flex flex-col justify-end gap-6">
                <SocialLinks socials={project.socials} />
                <p className="display text-sm text-[var(--secondary)]">
                  BOOKING: 918 602 908 (PEDRO JARRAIS)
                </p>
              </RevealOnScroll>
            </div>

            <VideoRow videos={project.videos} />
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
