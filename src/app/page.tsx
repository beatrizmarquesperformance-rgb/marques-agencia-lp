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
      <Header
        items={navItems}
        contactPhone={settings.contactPhone}
        contactName={settings.contactName}
        siteName={settings.siteName}
      />

      <main>
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
