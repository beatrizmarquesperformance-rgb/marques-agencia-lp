import Link from "next/link";
import { logout } from "@/lib/admin-actions";
import { hasDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-semibold">
            Conteúdos
          </Link>
          <Link href="/admin/settings" className="text-neutral-400 hover:text-white">
            Definições
          </Link>
          <Link href="/admin/played-at" className="text-neutral-400 hover:text-white">
            Já passámos por
          </Link>
          <a
            href="/"
            target="_blank"
            className="text-neutral-400 hover:text-white"
            rel="noreferrer"
          >
            Ver site ↗
          </a>
        </nav>
        <form action={logout}>
          <button className="text-sm text-neutral-400 hover:text-white">Sair</button>
        </form>
      </header>

      {!hasDb && (
        <p className="border-b border-amber-500/40 bg-amber-500/10 px-5 py-2 text-sm text-amber-300">
          Base de dados não ligada — as alterações não serão guardadas. Define{" "}
          <code>DATABASE_URL</code> e corre <code>npm run db:push && npm run db:seed</code>.
        </p>
      )}

      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
