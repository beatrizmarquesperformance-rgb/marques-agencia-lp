import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDb } from "@/lib/db";
import { getReferral, listLeads, referralStats } from "@/lib/crm-data";
import { regenerateCode, toggleReferral, updateReferral } from "@/lib/referral-actions";
import { referralUrl } from "@/lib/referral";
import { CopyButton } from "@/components/admin/CopyButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusSelect } from "@/components/admin/StatusSelect";

function fmtDate(d: Date | null | undefined): string {
  return d ? new Date(d).toLocaleDateString("pt-PT") : "—";
}

function fmtLeadDates(json: string): string {
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

export default async function ReferralDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  if (!hasDb) {
    return (
      <p className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        Base de dados não ligada.
      </p>
    );
  }

  const partner = await getReferral(id);
  if (!partner) notFound();

  const [stats, leads] = await Promise.all([referralStats(id), listLeads({ referralId: id })]);
  const url = referralUrl(partner.code);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/referrals" className="text-xs text-neutral-500 hover:text-white">
          ← Referrals
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{partner.name}</h1>
        {partner.company && <p className="text-neutral-400">{partner.company}</p>}
        {saved === "1" && <p className="mt-1 text-sm text-emerald-400">Guardado.</p>}
      </div>

      {/* Link */}
      <section className="rounded border border-neutral-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">Referral URL</p>
            <p className="mt-1 truncate font-mono text-sm text-neutral-200">{url}</p>
          </div>
          <CopyButton
            value={url}
            label="Copiar"
            className="shrink-0 rounded bg-white px-3 py-1.5 text-xs font-medium text-black"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] ${
              partner.active
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-neutral-700/30 text-neutral-400"
            }`}
          >
            {partner.active ? "Ativo" : "Inativo"}
          </span>
          <form action={toggleReferral.bind(null, id)}>
            <ConfirmButton
              message={
                partner.active
                  ? "Desativar este link? Novas visitas deixam de ser atribuídas a este parceiro."
                  : "Reativar este link?"
              }
            >
              {partner.active ? "Desativar link" : "Ativar link"}
            </ConfirmButton>
          </form>
          <form action={regenerateCode.bind(null, id)}>
            <ConfirmButton message="Gerar um código novo? O link antigo deixa de funcionar imediatamente.">
              Regenerar código
            </ConfirmButton>
          </form>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total leads" value={stats.totalLeads} />
        <Stat label="Leads este mês" value={stats.leadsThisMonth} />
        <Stat label="Última lead" value={fmtDate(stats.lastLeadAt)} />
        <Stat label="Visitas ao link" value={stats.visitCount} />
      </div>

      {/* Edit */}
      <section className="rounded border border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-300">Dados do parceiro</h2>
        <form action={updateReferral.bind(null, id)} className="mt-3 space-y-3">
          <Field label="Nome *">
            <input name="name" defaultValue={partner.name} required className="admin-input" />
          </Field>
          <Field label="Empresa">
            <input name="company" defaultValue={partner.company} className="admin-input" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={partner.email} className="admin-input" />
          </Field>
          <Field label="Notas (internas)">
            <textarea name="notes" defaultValue={partner.notes} rows={3} className="admin-input" />
          </Field>
          <button className="rounded bg-white px-4 py-1.5 text-sm font-medium text-black">
            Guardar
          </button>
        </form>
      </section>

      {/* Leads */}
      <section>
        <h2 className="text-sm font-medium text-neutral-300">
          Leads deste parceiro ({leads.length})
        </h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Ainda sem leads.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs uppercase text-neutral-500">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Lead</th>
                  <th className="py-2 pr-3">Empresa</th>
                  <th className="py-2 pr-3">Projeto</th>
                  <th className="py-2 pr-3">Datas</th>
                  <th className="py-2 pr-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-neutral-900 align-middle">
                    <td className="py-2 pr-3 whitespace-nowrap text-neutral-400">
                      {new Date(l.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/leads/${l.id}`} className="font-medium hover:underline">
                        {l.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-neutral-300">{l.company || "—"}</td>
                    <td className="py-2 pr-3 text-neutral-300">{l.project || "—"}</td>
                    <td className="py-2 pr-3 text-neutral-400">{fmtLeadDates(l.dates)}</td>
                    <td className="py-2 pr-3">
                      <StatusSelect id={l.id} value={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded border border-neutral-800 p-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      {children}
    </label>
  );
}
