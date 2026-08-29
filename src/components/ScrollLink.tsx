"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Anchor that smooth-scrolls to an in-page section, offset for the sticky
 * header. Falls back to a normal #hash link without JS.
 */
export function ScrollLink({
  targetId,
  children,
  className = "",
  style,
  onNavigate,
}: {
  targetId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onNavigate?: () => void;
}) {
  function handle(e: React.MouseEvent) {
    const el = document.getElementById(targetId);
    if (!el) return; // let the browser handle the hash
    e.preventDefault();
    const header = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const offset = parseInt(header, 10) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${targetId}`);
    onNavigate?.();
  }

  return (
    <a href={`#${targetId}`} onClick={handle} className={className} style={style}>
      {children}
    </a>
  );
}
