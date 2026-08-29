export function Footer({
  siteName,
  contactPhone,
  contactName,
}: {
  siteName: string | null;
  contactPhone: string;
  contactName: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--agency-bg)] px-5 py-14 text-[var(--agency-muted)] sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="display text-2xl text-[var(--agency-fg)]">
            {siteName ?? "Agência de Artistas"}
          </p>
          <p className="mt-2 text-sm">
            Reservas e informações:{" "}
            <a
              href={`tel:+351${contactPhone.replace(/\s/g, "")}`}
              className="text-[var(--agency-fg)] underline underline-offset-4"
            >
              {contactPhone}
            </a>{" "}
            ({contactName})
          </p>
        </div>
        <p className="text-xs">
          © {year} · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
