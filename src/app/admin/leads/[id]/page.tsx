import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDb } from "@/lib/db";
import { getLead } from "@/lib/crm-data";
import { updateLead } from "@/lib/referral-actions";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/types";
import { StatusSelect } from "@/components/admin/StatusSelect";

function fmtDates(json: string): string {
  try {
    const arr = JSON.parse(json) as string[];
    if (!arr.length) return "—";
    return arr.map((s) => new Date(s).toLocaleDateString("pt-PT")).join(" · ");
  } catch {
    return "—";
  }
}

export default async function LeadDetailPage({
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

  const lead = await getLead(id);
  if (!lead) notFound();

  const utm = [
    lead.utmSource && `source: ${lead.utmSource}`,
    lead.utmMedium && `medium: ${lead.utmMedium}`,
    lead.utmCampaign && `campaign: ${lead.utmCampaign}`,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/leads" className="text-xs text-neutral-500 hover:text-white">
          ← Leads
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{lead.name}</h1>
        <p className="text-sm text-neutral-500">
          Criada a {new Date(lead.createdAt).toLocaleString("pt-PT")}
          {" · "}atualizada a {new Date(lead.updatedAt).toLocaleString("pt-PT")}
        </p>
        {saved === "1" && <p className="mt-1 text-sm text-emerald-400">Guardado.</p>}
      </div>

      {/* Source */}
      <section className="rounded border border-neutral-800 p-4">
        <p className="text-[11px] uppercase tracking-wide text-neutral-500">Origem (SOURCE)</p>
        {lead.referral ? (
          <p className="mt-1">
            <Link
              href={`/admin/referrals/${lead.referral.id}`}
              className="font-medium hover:underline"
            >
              {lead.referral.name}
              {lead.referral.company ? ` — ${lead.referral.company}` : ""}
            </Link>
            <span className="ml-2 font-mono text-xs text-neutral-500">/r/{lead.referral.code}</span>
          </p>
        ) : (
          <p className="mt-1 text-neutral-300">Entrada direta (sem referral)</p>
        )}
        {utm.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">{utm.join("  ·  ")}</p>
        )}
        {lead.landingPath && lead.landingPath !== "/" && (
          <p className="mt-1 text-xs text-neutral-600">landing: {lead.landingPath}</p>
        )}
      </section>

      {/* Details */}
      <section className="grid gap-x-8 gap-y-3 rounded border border-neutral-800 p-4 sm:grid-cols-2">
        <Row label="Email" value={<a href={`mailto:${lead.email}`} className="underline">{lead.email}</a>} />
        <Row label="Telefone" value={<a href={`tel:${lead.phone}`} className="underline">{lead.phone}</a>} />
        <Row label="Projeto" value={lead.project || "—"} />
        <Row label="Formulário" value={lead.source === "page" ? "Formulário geral" : "Pop-up"} />
        <Row label="Datas pretendidas" value={fmtDates(lead.dates)} />
        <Row label="Estado atual" value={LEAD_STATUS_LABEL[lead.status]} />
      </section>

      {/* Edit */}
      <section className="rounded border border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-300">Editar</h2>
        <form action={updateLead.bind(null, id)} className="mt-3 space-y-4">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Estado
            <select name="status" defaultValue={lead.status} className="admin-input">
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Empresa
            <input name="company" defaultValue={lead.company} className="admin-input" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Mensagem
            <textarea name="message" defaultValue={lead.message} rows={5} className="admin-input" />
          </label>
          <button className="rounded bg-white px-4 py-1.5 text-sm font-medium text-black">
            Guardar
          </button>
        </form>
        <div className="mt-4 flex items-center gap-3 border-t border-neutral-800 pt-4 text-sm">
          <span className="text-neutral-400">Mudança rápida de estado:</span>
          <StatusSelect id={id} value={lead.status} size="lg" />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-0.5 text-sm text-neutral-200">{value}</div>
    </div>
  );
}
