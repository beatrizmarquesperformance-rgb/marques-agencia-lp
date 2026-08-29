"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ProjectOption } from "./ContactForm";
import { ContactModal } from "./ContactModal";

interface Ctx {
  /** Opens the proposal modal, optionally pre-filling "Projeto de interesse". */
  openContactModal: (project?: string) => void;
}

const ContactModalContext = createContext<Ctx>({ openContactModal: () => {} });

export function useContactModal(): Ctx {
  return useContext(ContactModalContext);
}

export function ContactModalProvider({
  projects,
  children,
}: {
  projects: ProjectOption[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<{ open: boolean; project?: string }>({ open: false });

  const openContactModal = useCallback((project?: string) => {
    setState({ open: true, project });
  }, []);
  const close = useCallback(() => setState({ open: false }), []);

  const value = useMemo(() => ({ openContactModal }), [openContactModal]);

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      {state.open && (
        <ContactModal project={state.project} projects={projects} onClose={close} />
      )}
    </ContactModalContext.Provider>
  );
}
