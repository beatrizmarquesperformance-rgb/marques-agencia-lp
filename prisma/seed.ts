import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/content/seed";

const prisma = new PrismaClient();

async function main() {
  for (const p of seedContent.projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
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
        heroCutoutSide: p.heroCutoutSide,
        bg: p.theme.bg,
        primary: p.theme.primary,
        secondary: p.theme.secondary,
        text: p.theme.text,
        accent: p.theme.accent,
        socials: {
          create: p.socials.map((s, i) => ({
            platform: s.platform,
            url: s.url,
            order: i,
          })),
        },
        photos: {
          create: p.photos
            .filter((ph) => ph.image)
            .map((ph, i) => ({ image: ph.image as string, alt: ph.alt, order: i })),
        },
        videos: {
          create: p.videos.map((v, i) => ({
            provider: v.provider,
            src: v.src,
            poster: v.poster,
            title: v.title,
            order: i,
          })),
        },
      },
    });
    console.log(`✓ ${p.name}`);
  }

  const s = seedContent.settings;
  const settings: [string, string | null][] = [
    ["siteName", s.siteName],
    ["contactPhone", s.contactPhone],
    ["contactName", s.contactName],
    ["bandsintownArtist", s.bandsintownArtist],
  ];
  for (const [key, value] of settings) {
    if (value == null) continue;
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✓ settings");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
