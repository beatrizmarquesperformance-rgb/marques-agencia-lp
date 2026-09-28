import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

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
  const logo = await logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0c0d",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={820} height={273} alt="ABRC" />
      </div>
    ),
    size,
  );
}
