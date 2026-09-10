"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { generateReferralCode } from "@/lib/referral";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

async function guard() {
  if (!(await isAuthed())) redirect("/login");
  if (!prisma) {
    throw new Error(
      "Sem base de dados: define DATABASE_URL e corre `npm run db:push`.",
    );
  }
  return prisma;
}

function bust() {
  revalidatePath("/admin");
  revalidatePath("/admin/referrals");
  revalidatePath("/admin/leads");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function codeExists(db: NonNullable<typeof prisma>, code: string): Promise<boolean> {
  return (await db.referral.count({ where: { code } })) > 0;
}

export async function createReferral(fd: FormData) {
  const db = await guard();
  const name = str(fd, "name").slice(0, 160);
  const company = str(fd, "company").slice(0, 160);
  const email = str(fd, "email").slice(0, 200);

  if (!name) throw new Error("O nome é obrigatório.");
  if (email && !EMAIL_RE.test(email)) throw new Error("E-mail inválido.");

  const code = await generateReferralCode(name, (c) => codeExists(db, c));

  let created;
  try {
    created = await db.referral.create({ data: { name, company, email, code } });
  } catch {
    // extremely unlikely unique clash — one more attempt with a longer tail
    const retry = await generateReferralCode(name + " x", (c) => codeExists(db, c));
    created = await db.referral.create({ data: { name, company, email, code: retry } });
  }

  bust();
  redirect(`/admin/referrals/${created.id}`);
}

export async function updateReferral(id: string, fd: FormData) {
  const db = await guard();
  const name = str(fd, "name").slice(0, 160);
  const email = str(fd, "email").slice(0, 200);
  if (!name) throw new Error("O nome é obrigatório.");
  if (email && !EMAIL_RE.test(email)) throw new Error("E-mail inválido.");

  await db.referral.update({
    where: { id },
    data: {
      name,
      company: str(fd, "company").slice(0, 160),
      email,
      notes: str(fd, "notes").slice(0, 2000),
    },
  });
  bust();
  redirect(`/admin/referrals/${id}?saved=1`);
}

export async function toggleReferral(id: string) {
  const db = await guard();
  const current = await db.referral.findUniqueOrThrow({ where: { id }, select: { active: true } });
  await db.referral.update({ where: { id }, data: { active: !current.active } });
  bust();
  revalidatePath(`/admin/referrals/${id}`);
}

export async function regenerateCode(id: string) {
  const db = await guard();
  const partner = await db.referral.findUniqueOrThrow({ where: { id }, select: { name: true } });
  const code = await generateReferralCode(partner.name, (c) => codeExists(db, c));
  await db.referral.update({ where: { id }, data: { code } });
  bust();
  revalidatePath(`/admin/referrals/${id}`);
}

export async function updateLeadStatus(id: string, status: string) {
  const db = await guard();
  if (!LEAD_STATUSES.includes(status as LeadStatus)) {
    throw new Error("Estado inválido.");
  }
  await db.lead.update({ where: { id }, data: { status: status as LeadStatus } });
  bust();
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLead(id: string, fd: FormData) {
  const db = await guard();
  const status = str(fd, "status");
  await db.lead.update({
    where: { id },
    data: {
      company: str(fd, "company").slice(0, 160),
      message: str(fd, "message").slice(0, 4000),
      ...(LEAD_STATUSES.includes(status as LeadStatus)
        ? { status: status as LeadStatus }
        : {}),
    },
  });
  bust();
  redirect(`/admin/leads/${id}?saved=1`);
}
