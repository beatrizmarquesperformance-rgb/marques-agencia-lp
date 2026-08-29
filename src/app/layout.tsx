import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import { getContent } from "@/lib/content";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings, projects } = await getContent();
  const name = settings.siteName ?? "Agência de Artistas";
  const roster = projects
    .filter((p) => !p.comingSoon)
    .map((p) => p.name)
    .join(" · ");

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: name,
      template: `%s — ${name}`,
    },
    description: `Projetos de animação e espetáculo para eventos, festivais, municípios e marcas: ${roster}.`,
    openGraph: {
      title: name,
      description: `Projetos de animação e espetáculo para eventos: ${roster}.`,
      type: "website",
      locale: "pt_PT",
      images: settings.ogImage ? [{ url: settings.ogImage }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${anton.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
