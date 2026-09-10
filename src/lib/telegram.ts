import "server-only";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const telegramEnabled = Boolean(TOKEN && CHAT_ID);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function formatDates(dates: string[]): string {
  if (!dates.length) return "—";
  return dates
    .map((d) =>
      new Date(d).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    )
    .join(", ");
}

export interface LeadMessage {
  name: string;
  email: string;
  phone: string;
  company?: string;
  project: string;
  message: string;
  source: "modal" | "page";
  dates: string[];
  /** "Nome — Empresa" of the partner that referred this lead, if any. */
  referralLabel?: string;
}

/**
 * Sends a lead to the Telegram group. Fire-and-forget: never throws, so a
 * Telegram outage can't break the form submission.
 */
export async function notifyTelegram(lead: LeadMessage): Promise<void> {
  if (!telegramEnabled) return;

  const text = [
    `🎯 <b>Nova lead${lead.project ? ` — ${esc(lead.project)}` : ""}</b>`,
    "",
    `👤 <b>${esc(lead.name)}</b>`,
    lead.company ? `🏢 ${esc(lead.company)}` : "",
    `📧 ${esc(lead.email)}`,
    `📱 ${esc(lead.phone)}`,
    `📅 ${esc(formatDates(lead.dates))}`,
    lead.referralLabel ? `🤝 Indicado por: ${esc(lead.referralLabel)}` : "",
    lead.message ? `\n📝 ${esc(lead.message)}` : "",
    "",
    `<i>${lead.source === "page" ? "formulário geral" : "pop-up"} · ${new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" })}</i>`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error("[telegram] sendMessage failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[telegram] notify error:", err);
  }
}
