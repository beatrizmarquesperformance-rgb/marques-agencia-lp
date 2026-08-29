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
  /** kept for API compatibility; triggering now uses a bottom rootMargin */
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
    // Initial geometry check so anything already on screen shows immediately
    // (and doesn't depend on an IO callback that may lag on first paint).
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.88 && r.bottom > 0;
    };
    el.dataset.shown = inView() ? "true" : "false";

    const io = new IntersectionObserver(
      ([entry]) => {
        // reveal as soon as any part enters; hide once fully past (so it
        // replays on scroll up) — works for blocks taller than the viewport
        el.dataset.shown = entry.isIntersecting ? "true" : "false";
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
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
