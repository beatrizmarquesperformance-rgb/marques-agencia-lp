import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--agency-bg)] px-6 text-center text-[var(--agency-fg)]">
      <div>
        <p className="display text-6xl">404</p>
        <p className="mt-3 text-[var(--agency-muted)]">Página não encontrada.</p>
        <Link
          href="/"
          className="display mt-6 inline-block border border-[var(--agency-line)] px-4 py-2 text-sm hover:bg-white/5"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
