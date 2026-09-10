import "server-only";
import { prisma } from "@/lib/db";
import {
  LEAD_STATUSES,
  type DashboardStats,
  type LeadRow,
  type LeadStatus,
  type ReferralRow,
  type ReferralStats,
} from "@/lib/types";

function emptyByStatus(): Record<LeadStatus, number> {
  return Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/* ---------------- Dashboard ---------------- */

export async function dashboardStats(): Promise<DashboardStats> {
  const base: DashboardStats = {
    totalLeads: 0,
    leadsThisMonth: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    byStatus: emptyByStatus(),
    last14Days: last14DayBuckets([]),
    topReferrals: [],
  };
  if (!prisma) return base;

  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [totalLeads, leadsThisMonth, totalReferrals, activeReferrals, statusGroups, recent, topGroups] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth() } } }),
      prisma.referral.count(),
      prisma.referral.count({ where: { active: true } }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.lead.groupBy({
        by: ["referralId"],
        where: { referralId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { referralId: "desc" } },
        take: 5,
      }),
    ]);

  const byStatus = emptyByStatus();
  for (const g of statusGroups) byStatus[g.status as LeadStatus] = g._count._all;

  const topIds = topGroups.map((g) => g.referralId!).filter(Boolean);
  const topPartners = topIds.length
    ? await prisma.referral.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, company: true },
      })
    : [];
  const topReferrals = topGroups
    .map((g) => {
      const p = topPartners.find((x) => x.id === g.referralId);
      return p ? { id: p.id, name: p.name, company: p.company, leadCount: g._count._all } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    totalLeads,
    leadsThisMonth,
    totalReferrals,
    activeReferrals,
    byStatus,
    last14Days: last14DayBuckets(recent.map((r) => r.createdAt)),
    topReferrals,
  };
}

function last14DayBuckets(dates: Date[]): { date: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const dt of dates) {
    const key = dt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

/* ---------------- Referrals ---------------- */

export async function listReferrals(opts: { q?: string; active?: "1" | "0" } = {}): Promise<
  ReferralRow[]
> {
  if (!prisma) return [];
  const q = opts.q?.trim();
  const rows = await prisma.referral.findMany({
    where: {
      ...(opts.active === "1" ? { active: true } : opts.active === "0" ? { active: false } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  const lastByReferral = await prisma.lead.groupBy({
    by: ["referralId"],
    where: { referralId: { in: rows.map((r) => r.id) } },
    _max: { createdAt: true },
  });
  const lastMap = new Map(lastByReferral.map((g) => [g.referralId, g._max.createdAt]));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    company: r.company,
    email: r.email,
    code: r.code,
    active: r.active,
    notes: r.notes,
    createdAt: r.createdAt,
    leadCount: r._count.leads,
    lastLeadAt: lastMap.get(r.id) ?? null,
  }));
}

export async function getReferral(id: string) {
  if (!prisma) return null;
  return prisma.referral.findUnique({ where: { id } });
}

export async function referralStats(id: string): Promise<ReferralStats> {
  const empty: ReferralStats = {
    totalLeads: 0,
    leadsThisMonth: 0,
    lastLeadAt: null,
    visitCount: 0,
    byStatus: emptyByStatus(),
  };
  if (!prisma) return empty;

  const [totalLeads, leadsThisMonth, last, visitCount, statusGroups] = await Promise.all([
    prisma.lead.count({ where: { referralId: id } }),
    prisma.lead.count({ where: { referralId: id, createdAt: { gte: startOfMonth() } } }),
    prisma.lead.findFirst({
      where: { referralId: id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.referralVisit.count({ where: { referralId: id } }),
    prisma.lead.groupBy({ by: ["status"], where: { referralId: id }, _count: { _all: true } }),
  ]);

  const byStatus = emptyByStatus();
  for (const g of statusGroups) byStatus[g.status as LeadStatus] = g._count._all;

  return {
    totalLeads,
    leadsThisMonth,
    lastLeadAt: last?.createdAt ?? null,
    visitCount,
    byStatus,
  };
}

/* ---------------- Leads ---------------- */

function toLeadRow(l: {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  project: string;
  message: string;
  dates: string;
  source: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  landingPath: string | null;
  referral: { id: string; name: string; company: string; code: string } | null;
}): LeadRow {
  return { ...l, status: l.status as LeadStatus };
}

const LEAD_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  project: true,
  message: true,
  dates: true,
  source: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  landingPath: true,
  referral: { select: { id: true, name: true, company: true, code: true } },
} as const;

export async function listLeads(
  opts: { q?: string; status?: string; referralId?: string } = {},
): Promise<LeadRow[]> {
  if (!prisma) return [];
  const q = opts.q?.trim();
  const status = LEAD_STATUSES.includes(opts.status as LeadStatus)
    ? (opts.status as LeadStatus)
    : undefined;

  const rows = await prisma.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(opts.referralId
        ? opts.referralId === "none"
          ? { referralId: null }
          : { referralId: opts.referralId }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: LEAD_SELECT,
  });
  return rows.map(toLeadRow);
}

export async function getLead(id: string): Promise<LeadRow | null> {
  if (!prisma) return null;
  const row = await prisma.lead.findUnique({ where: { id }, select: LEAD_SELECT });
  return row ? toLeadRow(row) : null;
}

/** For the referral filter dropdown. */
export async function referralOptions(): Promise<{ id: string; name: string; company: string }[]> {
  if (!prisma) return [];
  return prisma.referral.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });
}
