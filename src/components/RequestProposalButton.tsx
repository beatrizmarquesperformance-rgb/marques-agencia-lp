"use client";

import type { CSSProperties } from "react";
import { useContactModal } from "./contact/ContactModalProvider";

/** Opens the proposal modal with "Projeto de interesse" pre-filled to this project. */
export function RequestProposalButton({
  project,
  className = "cta cta-solid",
  style,
  children,
}: {
  project: string;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  const { openContactModal } = useContactModal();
  return (
    <button
      type="button"
      onClick={() => openContactModal(project)}
      className={className}
      style={style}
    >
      {children ?? `Pedir proposta para ${project}`}
    </button>
  );
}
