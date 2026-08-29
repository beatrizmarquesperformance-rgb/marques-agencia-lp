import "server-only";
import { prisma } from "@/lib/db";
import { seedContent } from "@/content/seed";
import type { Project } from "@/lib/types";

/** Admin reads: prefer DB, fall back to seed so the UI is explorable without a DB. */
export async function adminProjects(): Promise<Project[]> {
  if (!prisma) return seedContent.projects;
  const rows = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: {
      socials: { orderBy: { order: "asc" } },
      photos: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
  });
  return rows.map((p) => ({
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
    theme: {
      bg: p.bg,
      primary: p.primary,
      secondary: p.secondary,
      text: p.text,
      accent: p.accent,
    },
    socials: p.socials.map((s) => ({ platform: s.platform as never, url: s.url })),
    photos: p.photos.map((x) => ({ image: x.image, alt: x.alt })),
    videos: p.videos.map((v) => ({
      provider: v.provider as never,
      src: v.src,
      poster: v.poster,
      title: v.title,
    })),
  }));
}

export async function adminProject(slug: string): Promise<Project | undefined> {
  return (await adminProjects()).find((p) => p.slug === slug);
}

export async function adminSettings() {
  if (!prisma) {
    const s = seedContent.settings;
    return {
      siteName: s.siteName ?? "",
      ogImage: s.ogImage ?? "",
      contactPhone: s.contactPhone,
      contactName: s.contactName,
      bandsintownArtist: s.bandsintownArtist ?? "",
    };
  }
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    siteName: map.siteName ?? "",
    ogImage: map.ogImage ?? "",
    contactPhone: map.contactPhone ?? seedContent.settings.contactPhone,
    contactName: map.contactName ?? seedContent.settings.contactName,
    bandsintownArtist: map.bandsintownArtist ?? "",
  };
}

export async function adminPlayedAt() {
  if (!prisma) return seedContent.playedAt.map((p) => ({ ...p }));
  return prisma.playedAt.findMany({ orderBy: { order: "asc" } });
}
