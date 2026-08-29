import { adminLeads } from "@/lib/admin-data";
import { hasDb } from "@/lib/db";

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

export default async function LeadsPage() {
  const leads = await adminLeads();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pedidos de proposta</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Submissões dos formulários do site (modal e formulário geral).
      </p>

      {!hasDb ? (
        <p className="mt-6 text-sm text-amber-300">
          Sem base de dados ligada — os pedidos são registados apenas no log do servidor.
        </p>
      ) : leads.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Ainda não há pedidos.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase text-neutral-500">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Contacto</th>
                <th className="py-2 pr-3">Projeto</th>
                <th className="py-2 pr-3">Datas previstas</th>
                <th className="py-2 pr-3">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-neutral-900 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap text-neutral-400">
                    {l.createdAt.toLocaleDateString("pt-PT")}
                  </td>
                  <td className="py-2 pr-3">{l.name}</td>
                  <td className="py-2 pr-3">
                    <a href={`mailto:${l.email}`} className="underline">{l.email}</a>
                    <br />
                    <span className="text-neutral-400">{l.phone}</span>
                  </td>
                  <td className="py-2 pr-3">
                    {l.project || "—"}
                    <br />
                    <span className="text-[11px] uppercase text-neutral-600">{l.source}</span>
                  </td>
                  <td className="py-2 pr-3 text-neutral-300">{fmtDates(l.dates)}</td>
                  <td className="py-2 pr-3 max-w-xs text-neutral-300">{l.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
