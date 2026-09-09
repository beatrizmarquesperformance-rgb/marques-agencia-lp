"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface Guard {
  /** call before an upload starts */
  begin: () => void;
  /** call when it finishes (success or error) */
  end: () => void;
  pending: number;
}

const Ctx = createContext<Guard>({ begin: () => {}, end: () => {}, pending: 0 });

export const useUploadGuard = () => useContext(Ctx);

/**
 * While any admin upload is in flight, block every form submit on the page so
 * a fast "Guardar" click can't save before the new file URL lands.
 */
export function UploadGuard({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);
  const pendingRef = useRef(0);

  const begin = useCallback(() => {
    pendingRef.current += 1;
    setPending(pendingRef.current);
  }, []);
  const end = useCallback(() => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    setPending(pendingRef.current);
  }, []);

  useEffect(() => {
    if (pending === 0) return;
    const block = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      // eslint-disable-next-line no-alert
      alert("Aguarda que o upload termine antes de guardar.");
    };
    document.addEventListener("submit", block, true);
    return () => document.removeEventListener("submit", block, true);
  }, [pending]);

  return (
    <Ctx.Provider value={{ begin, end, pending }}>
      {children}
      {pending > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded bg-white px-4 py-2 text-sm text-black shadow-lg">
          A enviar ficheiro… não guardes ainda.
        </div>
      )}
    </Ctx.Provider>
  );
}
