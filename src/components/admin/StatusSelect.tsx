"use client";

import { useState, useTransition } from "react";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/types";
import { updateLeadStatus } from "@/lib/referral-actions";

const TONE: Record<LeadStatus, string> = {
  NEW: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  CONTACTED: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  QUALIFIED: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  BOOKED: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  WON: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  LOST: "border-neutral-600/50 bg-neutral-700/20 text-neutral-400",
};

export function StatusSelect({
  id,
  value,
  size = "sm",
}: {
  id: string;
  value: LeadStatus;
  size?: "sm" | "lg";
}) {
  const [status, setStatus] = useState<LeadStatus>(value);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        setStatus(next);
        startTransition(async () => {
          try {
            await updateLeadStatus(id, next);
          } catch {
            setStatus(value);
          }
        });
      }}
      className={`rounded border font-medium outline-none disabled:opacity-50 ${TONE[status]} ${
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs"
      }`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-neutral-900 text-neutral-100">
          {LEAD_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
