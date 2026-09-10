import Link from "next/link";
import { hasDb } from "@/lib/db";
import { listReferrals } from "@/lib/crm-data";
import { createReferral, toggleReferral } from "@/lib/referral-actions";
import { referralUrl } from "@/lib/referral";
import { CopyButton } from "@/components/admin/CopyButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString("pt-PT") : "—";
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; active?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const active = sp.active === "1" || sp.active === "0" ? sp.active : "";
  const rows = await listReferrals({ q: q || undefined, active: (active || undefined) as "1" | "0" | undefined });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Referrals</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Parceiros que recomendam clientes. Cada um tem um link único{" "}
          <code>/r/&#123;código&#125;</code> — as leads que entram por esse link ficam-lhe
          automaticamente associadas.
        </p>
      </div>

      {!hasDb ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Base de dados não ligada — os referrals precisam de <code>DATABASE_URL</code>.
        </p>
      ) : (
        <>
          {/* Create */}
          <section className="rounded border border-neutral-800 p-4">
            <h2 className="text-sm font-medium text-neutral-300">Novo parceiro</h2>
            <form action={createReferral} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Input name="name" placeholder="Nome *" required />
              <Input name="company" placeholder="Empresa" />
              <Input name="email" type="email" placeholder="Email" />
              <button className="rounded bg-white px-4 py-2 text-sm font-medium text-black">
                Criar
              </button>
            </form>
            <p className="mt-2 text-xs text-neutral-600">
              O código do link é gerado automaticamente.
            </p>
          </section>

          {/* Filters */}
          <form className="flex flex-wrap items-center gap-2 text-sm">
            <input
              name="q"
              defaultValue={q}
              placeholder="Pesquisar nome, empresa, email, código…"
              className="min-w-56 flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 outline-none"
            />
            <select
              name="active"
              defaultValue={active}
              className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5"
            >
              <option value="">Todos</option>
              <option value="1">Ativos</option>
              <option value="0">Inativos</option>
            </select>
            <button className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800">
              Filtrar
            </button>
            {(q || active) && (
              <Link href="/admin/referrals" className="text-neutral-500 hover:text-white">
                Limpar
              </Link>
            )}
          </form>

          {/* Table */}
          {rows.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {q || active ? "Nenhum parceiro corresponde aos filtros." : "Ainda não há parceiros. Cria o primeiro acima."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs uppercase text-neutral-500">
                    <th className="py-2 pr-3">Pessoa</th>
                    <th className="py-2 pr-3">Empresa</th>
                    <th className="py-2 pr-3 text-right">Leads</th>
                    <th className="py-2 pr-3">Última lead</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-900 align-middle">
                      <td className="py-2 pr-3">
                        <Link href={`/admin/referrals/${r.id}`} className="font-medium hover:underline">
                          {r.name}
                        </Link>
                        <br />
                        <code className="text-[11px] text-neutral-500">/r/{r.code}</code>
                      </td>
                      <td className="py-2 pr-3 text-neutral-300">{r.company || "—"}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{r.leadCount}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-neutral-400">
                        {fmtDate(r.lastLeadAt)}
                      </td>
                      <td className="py-2 pr-3">
                        {r.active ? (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-300">
                            Ativo
                          </span>
                        ) : (
                          <span className="rounded bg-neutral-700/30 px-1.5 py-0.5 text-[11px] text-neutral-400">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <CopyButton value={referralUrl(r.code)} label="Copiar link" />
                          <Link
                            href={`/admin/referrals/${r.id}`}
                            className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                          >
                            Ver
                          </Link>
                          <form action={toggleReferral.bind(null, r.id)}>
                            <ConfirmButton
                              message={
                                r.active
                                  ? "Desativar este link? Novas visitas deixam de ser atribuídas."
                                  : "Reativar este link?"
                              }
                            >
                              {r.active ? "Desativar" : "Ativar"}
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
    />
  );
}
