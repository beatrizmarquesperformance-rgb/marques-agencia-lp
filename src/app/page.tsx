import { getContent } from "@/lib/content";
import { Header } from "@/components/Header";
import { HeroVideo } from "@/components/HeroVideo";
import { CategoryRail } from "@/components/CategoryRail";
import { ProjectSection } from "@/components/ProjectSection";
import { BandsintownEvents } from "@/components/BandsintownEvents";
import { PlayedAtWall } from "@/components/PlayedAtWall";
import { ContactSection } from "@/components/contact/ContactSection";
import { ContactModalProvider } from "@/components/contact/ContactModalProvider";
import { Footer } from "@/components/Footer";

export const revalidate = 300;

export default async function HomePage() {
  const { settings, projects, playedAt } = await getContent();
  const visible = projects.filter((p) => p.enabled);
  const options = visible.map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <ContactModalProvider projects={options}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[110] focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Saltar para o conteúdo
      </a>
      <Header
        items={options}
        contactPhone={settings.contactPhone}
        contactName={settings.contactName}
        siteName={settings.siteName}
      />

      <main id="conteudo">
        <HeroVideo settings={settings} />
        <CategoryRail projects={visible} />

        {visible.map((project, i) => (
          <ProjectSection key={project.slug} project={project} index={i} />
        ))}

        <BandsintownEvents />
        <PlayedAtWall items={playedAt} />
        <ContactSection
          projects={options}
          contactPhone={settings.contactPhone}
          contactName={settings.contactName}
        />
      </main>

      <Footer
        siteName={settings.siteName}
        contactPhone={settings.contactPhone}
        contactName={settings.contactName}
      />
    </ContactModalProvider>
  );
}
