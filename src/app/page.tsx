import { getContent } from "@/lib/content";
import { Header } from "@/components/Header";
import { ProjectSection } from "@/components/ProjectSection";
import { BandsintownEvents } from "@/components/BandsintownEvents";
import { PlayedAtWall } from "@/components/PlayedAtWall";
import { Footer } from "@/components/Footer";

export const revalidate = 300;

export default async function HomePage() {
  const { settings, projects, playedAt } = await getContent();
  const navItems = projects
    .filter((p) => p.enabled)
    .map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Saltar para o conteúdo
      </a>
      <Header
        items={navItems}
        contactPhone={settings.contactPhone}
        contactName={settings.contactName}
        siteName={settings.siteName}
      />

      <main id="conteudo">
        {projects
          .filter((p) => p.enabled)
          .map((project, i) => (
            <ProjectSection key={project.slug} project={project} index={i} />
          ))}

        <BandsintownEvents />
        <PlayedAtWall items={playedAt} />
      </main>

      <Footer
        siteName={settings.siteName}
        contactPhone={settings.contactPhone}
        contactName={settings.contactName}
      />
    </>
  );
}
