"use client";

import { useId, useState } from "react";
import { MultiDatePicker } from "./MultiDatePicker";

export interface ProjectOption {
  slug: string;
  name: string;
}

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "phone" | "project", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s()\-.]/g, "");
  return /^\+?\d{9,15}$/.test(cleaned);
}

export function ContactForm({
  projects,
  defaultProject = "",
  source,
  onSuccess,
}: {
  projects: ProjectOption[];
  defaultProject?: string;
  source: "modal" | "page";
  onSuccess?: () => void;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [project, setProject] = useState(defaultProject);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Indica o teu nome.";
    if (!email.trim()) next.email = "Indica o teu e-mail.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "E-mail inválido.";
    if (!phone.trim()) next.phone = "Indica o teu telefone.";
    else if (!validPhone(phone)) next.phone = "Número de telefone inválido.";
    if (!project) next.project = "Escolhe um projeto.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, dates, project, message, source, website }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="py-6 text-center">
        <p className="display text-2xl text-[var(--success)]">Pedido enviado!</p>
        <p className="mt-2 text-sm text-[var(--agency-muted)]">
          Obrigado{name ? `, ${name.split(" ")[0]}` : ""}. Entramos em contacto brevemente.
        </p>
        {source === "page" && (
          <button
            type="button"
            onClick={() => {
              setName(""); setEmail(""); setPhone(""); setCompany(""); setDates([]);
              setProject(defaultProject); setMessage(""); setStatus("idle");
            }}
            className="cta mt-6"
          >
            Enviar outro pedido
          </button>
        )}
      </div>
    );
  }

  const field = (key: keyof Errors) => ({
    "aria-invalid": errors[key] ? ("true" as const) : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-err` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="field-label">Nome *</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            {...field("name")}
          />
          {errors.name && (
            <span id={`${uid}-name-err`} className="field-error">{errors.name}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="field-label">E-mail *</span>
          <input
            className="field"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            {...field("email")}
          />
          {errors.email && (
            <span id={`${uid}-email-err`} className="field-error">{errors.email}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="field-label">Telefone *</span>
          <input
            className="field"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+351 …"
            {...field("phone")}
          />
          {errors.phone && (
            <span id={`${uid}-phone-err`} className="field-error">{errors.phone}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="field-label">Empresa</span>
          <input
            className="field"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoComplete="organization"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="field-label">Projeto de interesse *</span>
          <select
            className="field"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            {...field("project")}
          >
            <option value="">Seleciona…</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.project && (
            <span id={`${uid}-project-err`} className="field-error">{errors.project}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <span className="field-label">Datas previstas</span>
        <MultiDatePicker value={dates} onChange={setDates} id={`${uid}-dates`} />
      </div>

      <label className="flex flex-col gap-1">
        <span className="field-label">Breve descrição</span>
        <textarea
          className="field min-h-24 resize-y"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tipo de evento, local, público estimado…"
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
      />

      {status === "error" && (
        <p role="alert" className="field-error">
          Não foi possível enviar. Tenta novamente ou liga: 918 602 908.
        </p>
      )}

      <button type="submit" disabled={status === "submitting"} className="cta cta-solid w-full">
        {status === "submitting" ? "A enviar…" : "Enviar pedido"}
      </button>
    </form>
  );
}
