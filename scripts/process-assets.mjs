/**
 * One-off: turn the raw press-kit folders in ~/Downloads into web-optimised
 * assets under public/media. Not part of the build — the outputs are committed.
 *
 * To re-run (adjust the D path below to where the raw folders live):
 *   npm i -D sharp ffmpeg-static ffprobe-static
 *   node scripts/process-assets.mjs            # all
 *   node scripts/process-assets.mjs marques    # one group
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const FFMPEG = ffmpegPath;
const D = "/Users/beatriz/Downloads";
const OUT = resolve("public/media");

const ensure = (p) => mkdirSync(dirname(p), { recursive: true });
const has = (p) => existsSync(p);

async function img(src, dest, width, { q = 78, fit = "cover", height } = {}) {
  const out = `${OUT}/${dest}`;
  ensure(out);
  let s = sharp(src, { failOn: "none" }).rotate();
  s = s.resize(width, height, { fit, withoutEnlargement: true });
  await s.webp({ quality: q, effort: 5 }).toFile(out);
  console.log("img ", dest);
}

function ff(args) {
  execFileSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });
}

/** vertical loop for the rail: small, muted, trimmed */
function promo(src, dest, seconds = 30) {
  const out = `${OUT}/${dest}`;
  ensure(out);
  ff([
    "-i", src,
    "-t", String(seconds),
    "-an",
    "-vf", "scale=540:-2,fps=24",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "32", "-preset", "veryfast", "-movflags", "+faststart",
    out,
  ]);
  console.log("promo", dest);
}

/** horizontal hero background: muted, trimmed */
function hero(src, dest, seconds = 34) {
  const out = `${OUT}/${dest}`;
  ensure(out);
  ff([
    "-i", src,
    "-t", String(seconds),
    "-an",
    "-vf", "scale=1600:-2,fps=25",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "31", "-preset", "veryfast", "-movflags", "+faststart",
    out,
  ]);
  console.log("hero ", dest);
}

/** watchable gallery clip: 720p, keeps audio */
function clip(src, dest, { seconds } = {}) {
  const out = `${OUT}/${dest}`;
  ensure(out);
  const [w, h] = safeProbe(src).trim().split(",").map(Number);
  const portrait = h > w;
  ff([
    "-i", src,
    "-t", String(seconds ?? 42),
    "-vf", `scale=${portrait ? "720:-2" : "-2:720"},fps=30`,
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "29", "-preset", "fast", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "112k",
    out,
  ]);
  console.log("clip ", dest);
}

function safeProbe(src) {
  try {
    return execFileSync(ffprobeStatic.path, [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height", "-of", "csv=p=0", src,
    ]).toString();
  } catch {
    return "";
  }
}

/** grab a still frame as a webp */
async function frame(src, dest, at, width = 1400) {
  const tmp = `${OUT}/.frame-tmp.png`;
  ensure(tmp);
  ff(["-ss", String(at), "-i", src, "-frames:v", "1", "-q:v", "2", tmp]);
  await img(tmp, dest, width, { q: 80 });
}

// ---------------------------------------------------------------------------

const M = `${D}/DJ Marques`;
const P = `${D}/Pimba à Bruta`;
const K = `${D}/Mídia Kit Kisscam Party`;
const G = `${D}/GangBangers 2`;

const tasks = {
  async marques() {
    copyFileSync(`${M}/Logo Marques/Dj-Marques-01__Dj-Marques-01.svg`, ensureP(`${OUT}/marques/logo.svg`));
    const solo = `${M}/Fotos Press Kit/Marques Solo`;
    const maycon = `${M}/Fotos Press Kit/Marques + Maycon`;
    await img(`${solo}/MARQUES_V.S._-4.JPG`, "marques/hero.webp", 2000, { q: 82 });
    await img(`${solo}/DSC00567.JPG`, "marques/promo-poster.webp", 900, { q: 80 });
    await img(`${solo}/DSC00607.JPG`, "marques/g1.webp", 1400);
    await img(`${solo}/DSC00484.JPG`, "marques/g2.webp", 1400);
    await img(`${solo}/IMG_9930.JPG`, "marques/g3.webp", 1400);
    await img(`${solo}/IMG_9932.JPG`, "marques/g4.webp", 1400);
    await img(`${maycon}/2.png`, "marques/g5.webp", 1400);
    await img(`${maycon}/3.png`, "marques/g6.webp", 1400);
    promo(`${M}/Aftermovies/1 - Marques (Festa de Negrais).mp4`, "marques/promo.mp4");
    clip(`${M}/Aftermovies/2 - Marques (Festa de Peniche).mp4`, "marques/v1.mp4");
    await frame(`${M}/Aftermovies/2 - Marques (Festa de Peniche).mp4`, "marques/v1-poster.webp", 3, 900);
  },

  async pimba() {
    await img(`${P}/Logotipo/Logotipo Pimba á Bruta.png`, "pimba/logo.webp", 1000, { fit: "inside", q: 92 });
    const c = `${P}/Fotos Cartaz`;
    await img(`${c}/3.jpg`, "pimba/hero.webp", 2000, { q: 80 });
    await img(`${c}/1 - Foto Principal.jpg`, "pimba/g1.webp", 1400);
    await img(`${c}/2.jpg`, "pimba/g2.webp", 1400);
    await img(`${c}/4.jpg`, "pimba/g3.webp", 1400);
    promo(`${P}/Aftermovie.mp4`, "pimba/promo.mp4");
    await frame(`${P}/Aftermovie.mp4`, "pimba/promo-poster.webp", 4, 900);
    clip(`${P}/Aftermovie.mp4`, "pimba/v1.mp4");
    await frame(`${P}/Aftermovie.mp4`, "pimba/v1-poster.webp", 6, 900);
  },

  async funkiss() {
    const pk = `${K}/Presskit (fotos)`;
    const am = `${K}/Aftermovie (Motion flyer)`;
    await img(`${pk}/1.JPG`, "funkiss/hero.webp", 2000, { q: 80 });
    await img(`${pk}/2.png`, "funkiss/g1.webp", 1400);
    await img(`${pk}/3.png`, "funkiss/g2.webp", 1400);
    await frame(`${am}/1 - Aftermovie Guerra dos Sexos FMH.MP4`, "funkiss/g3.webp", 12);
    await frame(`${am}/1 - Aftermovie Guerra dos Sexos FMH.MP4`, "funkiss/g4.webp", 34);
    // KISSCAM lockups saved but unused (project name is FUNKISS per brief)
    await img(`${K}/Logo Kisscam/KISSCAM logo (com texto) .png`, "funkiss/logo-kisscam.webp", 1000, { fit: "inside", q: 92 });
    promo(`${am}/1 - Aftermovie Guerra dos Sexos FMH.MP4`, "funkiss/promo.mp4");
    await frame(`${am}/1 - Aftermovie Guerra dos Sexos FMH.MP4`, "funkiss/promo-poster.webp", 5, 900);
    clip(`${am}/2 - Aftermovie Tenda de Negrais.mp4`, "funkiss/v1.mp4");
    await frame(`${am}/2 - Aftermovie Tenda de Negrais.mp4`, "funkiss/v1-poster.webp", 3, 900);
  },

  async gangbangers() {
    await img(`${G}/Logotipo/GANG_BANGERS.png`, "gangbangers/logo.webp", 1000, { fit: "inside", q: 92 });
    const main = `${G}/Aftermovie/Video Ganbangers.MP4`;
    await frame(main, "gangbangers/hero.webp", 22, 2000);
    await frame(main, "gangbangers/g1.webp", 6);
    await frame(main, "gangbangers/g2.webp", 16);
    await frame(main, "gangbangers/g3.webp", 30);
    await frame(main, "gangbangers/g4.webp", 44);
    promo(main, "gangbangers/promo.mp4");
    await frame(main, "gangbangers/promo-poster.webp", 3, 900);
    clip(`${G}/Shorts/copy_2255B6CD-C666-4DEF-AB01-435140001244.MOV`, "gangbangers/v1.mp4", { seconds: 30 });
    await frame(`${G}/Shorts/copy_2255B6CD-C666-4DEF-AB01-435140001244.MOV`, "gangbangers/v1-poster.webp", 2, 900);
  },

  async general() {
    const src = `${M}/Aftermovies/Enterro Aveiro (Vídeo Horizontal).mp4`;
    hero(src, "hero.mp4");
    await frame(src, "hero-poster.webp", 19, 1920);
  },
};

function ensureP(p) {
  mkdirSync(dirname(p), { recursive: true });
  return p;
}

const only = process.argv[2];
const run = only ? { [only]: tasks[only] } : tasks;
for (const [name, fn] of Object.entries(run)) {
  if (!fn) continue;
  console.log(`\n=== ${name} ===`);
  await fn();
}
console.log("\ndone.");
