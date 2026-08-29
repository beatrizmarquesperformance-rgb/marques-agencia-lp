"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Adds data-shown when the element enters the viewport and removes it when it
 * leaves — so the reveal replays on scroll up as well as down.
 * No-ops under prefers-reduced-motion (CSS already shows the content).
 */
export function RevealOnScroll({
  children,
  className = "",
  as: Tag = "div",
  amount = 0.18,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "figure";
  amount?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.shown = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.shown = entry.isIntersecting ? "true" : "false";
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  const Comp = Tag as "div";
  return (
    <Comp ref={ref as React.Ref<HTMLDivElement>} className={`reveal ${className}`}>
      {children}
    </Comp>
  );
}
