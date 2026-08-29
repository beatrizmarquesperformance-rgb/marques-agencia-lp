"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { ContactForm, type ProjectOption } from "./ContactForm";
import { useLockBodyScroll } from "./useLockBodyScroll";

export function ContactModal({
  project,
  projects,
  onClose,
}: {
  project?: string;
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useLockBodyScroll(true);

  useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    const card = cardRef.current;
    card?.querySelector<HTMLElement>("button, input, select, textarea, a[href]")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !card) return;
      const focusable = card.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocused.current?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-card relative my-auto w-full max-w-lg rounded-[var(--radius)] border border-[var(--agency-line)] bg-[var(--agency-bg)] p-5 text-[var(--agency-fg)] shadow-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-[var(--radius)] text-xl text-[var(--agency-muted)] hover:bg-white/10 hover:text-[var(--agency-fg)]"
        >
          ✕
        </button>

        <h2 id={titleId} className="display pr-8 text-2xl">
          Pedir proposta
          {project ? <span className="text-[var(--agency-muted)]"> — {project}</span> : null}
        </h2>
        <p className="mt-1 text-sm text-[var(--agency-muted)]">
          Preenche os dados e recebes uma proposta à medida.
        </p>

        <div className="mt-5">
          <ContactForm projects={projects} defaultProject={project ?? ""} source="modal" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
