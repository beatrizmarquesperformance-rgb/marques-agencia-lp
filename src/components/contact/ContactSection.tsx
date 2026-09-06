import type { Contact } from "@/lib/types";
import { telHref } from "@/lib/contacts";
import { ContactForm, type ProjectOption } from "./ContactForm";

/** General contact form at the end of the page — no project pre-selected. */
export function ContactSection({
  projects,
  contacts,
}: {
  projects: ProjectOption[];
  contacts: Contact[];
}) {
  return (
    <section
      id="contacto"
      className="grain relative scroll-mt-[var(--header-h)] border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-4 py-20 text-[var(--agency-fg)] sm:px-6"
    >
      <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <h2 className="display text-4xl sm:text-6xl">Pedir proposta</h2>
          <p className="mt-4 max-w-md text-[var(--agency-muted)]">
            Diz-nos o que estás a organizar e recebes uma proposta à medida para o teu evento.
          </p>
          <p className="mt-6 text-sm text-[var(--agency-muted)]">
            Ou liga diretamente:{" "}
            {contacts.map((c, i) => (
              <span key={c.phone}>
                {i > 0 && " · "}
                <a
                  href={telHref(c.phone)}
                  className="text-[var(--agency-fg)] underline underline-offset-4"
                >
                  {c.phone}
                </a>{" "}
                ({c.name})
              </span>
            ))}
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--agency-line)] bg-white/[0.02] p-5 sm:p-7">
          <ContactForm projects={projects} source="page" />
        </div>
      </div>
    </section>
  );
}
