"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

async function guard() {
  if (!(await isAuthed())) redirect("/login");
  if (!prisma) {
    throw new Error(
      "Sem base de dados: define DATABASE_URL e corre `npm run db:push && npm run db:seed`.",
    );
  }
  return prisma;
}

function bust() {
  revalidateTag("site-content");
  revalidatePath("/");
  revalidatePath("/admin");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const int = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : d;
};

export async function saveProject(slug: string, fd: FormData) {
  const db = await guard();
  await db.project.update({
    where: { slug },
    data: {
      name: str(fd, "name"),
      tagline: str(fd, "tagline") || null,
      description: String(fd.get("description") ?? ""),
      heroAlt: str(fd, "heroAlt"),
      heroImage: str(fd, "heroImage") || null,
      logoImage: str(fd, "logoImage") || null,
      heroCutout: str(fd, "heroCutout") || null,
      heroCutoutSide: str(fd, "heroCutoutSide") === "right" ? "right" : "left",
      promoProvider: str(fd, "promoProvider") || "mp4",
      promoSrc: str(fd, "promoSrc") || null,
      promoPoster: str(fd, "promoPoster") || null,
      enabled: bool(fd, "enabled"),
      comingSoon: bool(fd, "comingSoon"),
      order: int(fd, "order"),
      bg: str(fd, "bg"),
      primary: str(fd, "primary"),
      secondary: str(fd, "secondary"),
      text: str(fd, "text"),
      accent: str(fd, "accent"),
    },
  });
  bust();
  redirect(`/admin/project/${slug}?saved=1`);
}

export async function replaceSocials(slug: string, fd: FormData) {
  const db = await guard();
  const project = await db.project.findUniqueOrThrow({ where: { slug } });
  const platforms = fd.getAll("platform").map(String);
  const urls = fd.getAll("url").map(String);
  await db.social.deleteMany({ where: { projectId: project.id } });
  const rows = platforms
    .map((platform, i) => ({ platform, url: (urls[i] ?? "").trim(), order: i }))
    .filter((r) => r.url.length > 3);
  if (rows.length) {
    await db.social.createMany({
      data: rows.map((r) => ({ ...r, projectId: project.id })),
    });
  }
  bust();
  redirect(`/admin/project/${slug}?saved=1`);
}

export async function replacePhotos(slug: string, fd: FormData) {
  const db = await guard();
  const project = await db.project.findUniqueOrThrow({ where: { slug } });
  const images = fd.getAll("image").map(String);
  const alts = fd.getAll("alt").map(String);
  await db.galleryPhoto.deleteMany({ where: { projectId: project.id } });
  const rows = images
    .map((image, i) => ({ image: image.trim(), alt: (alts[i] ?? "").trim(), order: i }))
    .filter((r) => r.image.length > 3);
  if (rows.length) {
    await db.galleryPhoto.createMany({
      data: rows.map((r) => ({ ...r, projectId: project.id })),
    });
  }
  bust();
  redirect(`/admin/project/${slug}?saved=1`);
}

export async function replaceVideos(slug: string, fd: FormData) {
  const db = await guard();
  const project = await db.project.findUniqueOrThrow({ where: { slug } });
  const providers = fd.getAll("provider").map(String);
  const srcs = fd.getAll("src").map(String);
  const posters = fd.getAll("poster").map(String);
  const titles = fd.getAll("title").map(String);
  await db.video.deleteMany({ where: { projectId: project.id } });
  const rows = srcs
    .map((src, i) => ({
      src: src.trim(),
      provider: providers[i] ?? "mp4",
      poster: (posters[i] ?? "").trim() || null,
      title: (titles[i] ?? "").trim(),
      order: i,
    }))
    .filter((r) => r.src.length > 3);
  if (rows.length) {
    await db.video.createMany({
      data: rows.map((r) => ({ ...r, projectId: project.id })),
    });
  }
  bust();
  redirect(`/admin/project/${slug}?saved=1`);
}

export async function saveSettings(fd: FormData) {
  const db = await guard();
  const entries: [string, string][] = [
    ["siteName", str(fd, "siteName")],
    ["ogImage", str(fd, "ogImage")],
    ["contactPhone", str(fd, "contactPhone")],
    ["contactName", str(fd, "contactName")],
    ["contactPhone2", str(fd, "contactPhone2")],
    ["contactName2", str(fd, "contactName2")],
    ["contactEmail", str(fd, "contactEmail")],
    ["bandsintownArtist", str(fd, "bandsintownArtist")],
    ["heroVideoProvider", str(fd, "heroVideoProvider") || "mp4"],
    ["heroVideoSrc", str(fd, "heroVideoSrc")],
    ["heroVideoPoster", str(fd, "heroVideoPoster")],
    ["heroHeadline", str(fd, "heroHeadline")],
    ["heroSubhead", str(fd, "heroSubhead")],
  ];
  for (const [key, value] of entries) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  bust();
  redirect("/admin/settings?saved=1");
}

export async function savePlayedAt(fd: FormData) {
  const db = await guard();
  const names = fd.getAll("name").map(String);
  const logos = fd.getAll("logo").map(String);
  const urls = fd.getAll("paurl").map(String);
  await db.playedAt.deleteMany({});
  const rows = names
    .map((name, i) => ({
      name: name.trim(),
      logo: (logos[i] ?? "").trim() || null,
      url: (urls[i] ?? "").trim() || null,
      order: i,
      enabled: true,
    }))
    .filter((r) => r.name.length > 0);
  if (rows.length) await db.playedAt.createMany({ data: rows });
  bust();
  redirect("/admin/played-at?saved=1");
}

export async function logout() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/login");
}
