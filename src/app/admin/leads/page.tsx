import Link from "next/link";
import { hasDb } from "@/lib/db";
import { listLeads, referralOptions } from "@/lib/crm-data";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/types";
import { StatusSelect } from "@/components/admin/StatusSelect";

function fmtDates(json: string): string {
  try {
    const arr = JSON.parse(json) as string[];
    if (!arr.length) return "—";
    return arr
      .map((s) => new Date(s).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }))
      .join(", ");
  } catch {
    return "—";
  }
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "";
  const ref = sp.ref ?? "";

  const [leads, partners] = await Promise.all([
    listLeads({ q: q || undefined, status: status || undefined, referralId: ref || undefined }),
    referralOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Submissões dos formulários do site (pop-up por projeto e formulário geral).
        </p>
      </div>

      {!hasDb ? (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Sem base de dados ligada — os pedidos são registados apenas no log do servidor.
        </p>
      ) : (
        <>
          <form className="flex flex-wrap items-center gap-2 text-sm">
            <input
              name="q"
              defaultValue={q}
              placeholder="Pesquisar nome, email, empresa, telefone…"
              className="min-w-56 flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 outline-none"
            />
            <select
              name="status"
              defaultValue={status}
              className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5"
            >
              <option value="">Todos os estados</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select
              name="ref"
              defaultValue={ref}
              className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5"
            >
              <option value="">Todas as origens</option>
              <option value="none">Entrada direta</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.company ? ` · ${p.company}` : ""}
                </option>
              ))}
            </select>
            <button className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800">
              Filtrar
            </button>
            {(q || status || ref) && (
              <Link href="/admin/leads" className="text-neutral-500 hover:text-white">
                Limpar
              </Link>
            )}
          </form>

          {leads.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {q || status || ref ? "Nenhuma lead corresponde aos filtros." : "Ainda não há leads."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs uppercase text-neutral-500">
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Contacto</th>
                    <th className="py-2 pr-3">Empresa</th>
                    <th className="py-2 pr-3">Projeto</th>
                    <th className="py-2 pr-3">Origem</th>
                    <th className="py-2 pr-3">Datas</th>
                    <th className="py-2 pr-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-neutral-900 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap text-neutral-400">
                        <Link href={`/admin/leads/${l.id}`} className="hover:underline">
                          {new Date(l.createdAt).toLocaleDateString("pt-PT")}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">
                        <Link href={`/admin/leads/${l.id}`} className="font-medium hover:underline">
                          {l.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">
                        <a href={`mailto:${l.email}`} className="underline">
                          {l.email}
                        </a>
                        <br />
                        <span className="text-neutral-400">{l.phone}</span>
                      </td>
                      <td className="py-2 pr-3 text-neutral-300">{l.company || "—"}</td>
                      <td className="py-2 pr-3">
                        {l.project || "—"}
                        <br />
                        <span className="text-[11px] uppercase text-neutral-600">{l.source}</span>
                      </td>
                      <td className="py-2 pr-3">
                        {l.referral ? (
                          <Link
                            href={`/admin/referrals/${l.referral.id}`}
                            className="text-neutral-200 hover:underline"
                          >
                            {l.referral.name}
                            {l.referral.company && (
                              <span className="block text-[11px] text-neutral-500">
                                {l.referral.company}
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span className="text-neutral-600">Direto</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-neutral-300">{fmtDates(l.dates)}</td>
                      <td className="py-2 pr-3">
                        <StatusSelect id={l.id} value={l.status} />
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
