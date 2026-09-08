import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/content/seed";

const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  url ? { datasources: { db: { url } } } : undefined,
);

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
        promoProvider: p.promoVideo.provider,
        promoSrc: p.promoVideo.src,
        promoPoster: p.promoVideo.poster,
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
    ["contactPhone2", s.contactPhone2],
    ["contactName2", s.contactName2],
    ["contactEmail", s.contactEmail],
    ["bandsintownArtist", s.bandsintownArtist],
    ["heroVideoProvider", s.heroVideoProvider],
    ["heroVideoSrc", s.heroVideoSrc],
    ["heroVideoPoster", s.heroVideoPoster],
    ["heroHeadline", s.heroHeadline],
    ["heroSubhead", s.heroSubhead],
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
