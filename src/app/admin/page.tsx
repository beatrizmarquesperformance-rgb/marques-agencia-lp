import Link from "next/link";
import { hasDb } from "@/lib/db";
import { dashboardStats } from "@/lib/crm-data";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/types";
import { MiniBarChart } from "@/components/admin/MiniBarChart";

export default async function DashboardPage() {
  const s = await dashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Visão geral de leads e parceiros (referrals).
        </p>
      </div>

      {!hasDb && (
        <p className="rounded border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Base de dados não ligada — sem métricas. Define <code>DATABASE_URL</code>.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total leads" value={s.totalLeads} />
        <Stat label="Leads este mês" value={s.leadsThisMonth} />
        <Stat label="Total referrals" value={s.totalReferrals} />
        <Stat label="Referrals ativos" value={s.activeReferrals} />
      </div>

      <section className="rounded border border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-300">Leads — últimos 14 dias</h2>
        <div className="mt-3">
          <MiniBarChart data={s.last14Days} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded border border-neutral-800 p-4">
          <h2 className="text-sm font-medium text-neutral-300">Leads por estado</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {LEAD_STATUSES.map((st) => (
              <li key={st} className="flex items-center justify-between">
                <span className="text-neutral-400">{LEAD_STATUS_LABEL[st]}</span>
                <span className="tabular-nums text-neutral-200">{s.byStatus[st]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-300">Top referrals</h2>
            <Link href="/admin/referrals" className="text-xs text-neutral-500 hover:text-white">
              Ver todos →
            </Link>
          </div>
          {s.topReferrals.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Ainda sem leads atribuídas.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {s.topReferrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <Link
                    href={`/admin/referrals/${r.id}`}
                    className="truncate text-neutral-300 hover:text-white"
                  >
                    {r.name}
                    {r.company && <span className="text-neutral-500"> · {r.company}</span>}
                  </Link>
                  <span className="tabular-nums text-neutral-200">{r.leadCount}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-neutral-800 p-4">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}
