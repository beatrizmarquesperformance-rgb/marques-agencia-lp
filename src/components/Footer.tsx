import Image from "next/image";
import type { Contact } from "@/lib/types";
import { telHref } from "@/lib/contacts";

export function Footer({
  siteName,
  contacts,
}: {
  siteName: string | null;
  contacts: Contact[];
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--agency-bg)] px-5 py-14 text-[var(--agency-muted)] sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Image
            src="/media/brand/logo-abrc.png"
            alt={siteName ?? "ABRC — Always Busy Rockin Crowds Agency"}
            width={302}
            height={100}
            className="h-10 w-auto sm:h-12"
          />
          <p className="mt-4 text-sm">
            Reservas e informações:{" "}
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
        <p className="text-xs">© {year} · Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
