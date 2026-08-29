import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

export const alt = "Agência de artistas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const { settings, projects } = await getContent();
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
        <div style={{ fontSize: 34, letterSpacing: 2, opacity: 0.7 }}>
          {settings.siteName ?? "AGÊNCIA DE ARTISTAS"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 76, fontWeight: 800, lineHeight: 1 }}>
          {roster.map((name) => (
            <span key={name} style={{ textTransform: "uppercase" }}>
              {name}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 30, opacity: 0.7 }}>
          {`Booking: ${settings.contactPhone} · ${settings.contactName}`}
        </div>
      </div>
    ),
    size,
  );
}
