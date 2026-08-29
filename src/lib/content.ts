import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { seedContent } from "@/content/seed";
import type { Project, SiteContent, Social, Video, GalleryPhoto } from "@/lib/types";

async function loadFromDb(): Promise<SiteContent | null> {
  if (!prisma) return null;

  const [projectsRaw, playedAtRaw, settingsRaw] = await Promise.all([
    prisma.project.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
      include: {
        socials: { orderBy: { order: "asc" } },
        photos: { orderBy: { order: "asc" } },
        videos: { orderBy: { order: "asc" } },
      },
    }),
    prisma.playedAt.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    }),
    prisma.setting.findMany(),
  ]);

  const settings = Object.fromEntries(settingsRaw.map((s) => [s.key, s.value]));

  const projects: Project[] = projectsRaw.map((p) => ({
    slug: p.slug,
    name: p.name,
    order: p.order,
    enabled: p.enabled,
    comingSoon: p.comingSoon,
    tagline: p.tagline,
    description: p.description,
    heroImage: p.heroImage,
    heroAlt: p.heroAlt,
    logoImage: p.logoImage,
    heroCutout: p.heroCutout,
    heroCutoutSide: p.heroCutoutSide === "right" ? "right" : "left",
    theme: {
      bg: p.bg,
      primary: p.primary,
      secondary: p.secondary,
      text: p.text,
      accent: p.accent,
    },
    socials: p.socials.map((s): Social => ({
      platform: s.platform as Social["platform"],
      url: s.url,
    })),
    photos: p.photos.map((ph): GalleryPhoto => ({ image: ph.image, alt: ph.alt })),
    videos: p.videos.map((v): Video => ({
      provider: v.provider as Video["provider"],
      src: v.src,
      poster: v.poster,
      title: v.title,
    })),
  }));

  return {
    settings: {
      siteName: settings.siteName ?? null,
      ogImage: settings.ogImage ?? null,
      contactPhone: settings.contactPhone ?? seedContent.settings.contactPhone,
      contactName: settings.contactName ?? seedContent.settings.contactName,
      bandsintownArtist: settings.bandsintownArtist ?? null,
    },
    projects,
    playedAt: playedAtRaw.map((x) => ({ name: x.name, logo: x.logo, url: x.url })),
  };
}

const cachedDb = unstable_cache(loadFromDb, ["site-content"], {
  tags: ["site-content"],
  revalidate: 300,
});

export async function getContent(): Promise<SiteContent> {
  try {
    const fromDb = await cachedDb();
    if (fromDb && fromDb.projects.length > 0) return fromDb;
  } catch (err) {
    console.error("[content] DB read failed, falling back to seed:", err);
  }
  return seedContent;
}
