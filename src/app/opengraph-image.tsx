import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

export const alt = "ABRC — Agência de artistas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function logoDataUri(): Promise<string> {
  const file = await readFile(
    path.join(process.cwd(), "public/media/brand/logo-abrc.png"),
  );
  return `data:image/png;base64,${file.toString("base64")}`;
}

export default async function OgImage() {
  const [{ settings, projects }, logo] = await Promise.all([
    getContent(),
    logoDataUri(),
  ]);
  const roster = projects
    .filter((p) => !p.comingSoon)
    .map((p) => p.name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0d",
          color: "#f4f4f4",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={340} height={113} alt="ABRC" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 76, fontWeight: 800, lineHeight: 1 }}>
          {roster.map((name) => (
            <span key={name} style={{ textTransform: "uppercase" }}>
              {name}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>
          {[
            `${settings.contactPhone} · ${settings.contactName}`,
            settings.contactName2 && settings.contactPhone2
              ? `${settings.contactPhone2} · ${settings.contactName2}`
              : null,
          ]
            .filter(Boolean)
            .join("   |   ")}
        </div>
      </div>
    ),
    size,
  );
}
