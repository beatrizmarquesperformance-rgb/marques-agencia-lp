"use client";

import { useEffect, useState } from "react";

interface NavItem {
  slug: string;
  name: string;
}

export function Header({
  items,
  contactPhone,
  contactName,
  siteName,
}: {
  items: NavItem[];
  contactPhone: string;
  contactName: string;
  siteName: string | null;
}) {
  const [active, setActive] = useState<string>(items[0]?.slug ?? "");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => Boolean(el));

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const go = (slug: string) => {
    setOpen(false);
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-[var(--agency-bg-blur)] backdrop-blur border-b border-[var(--agency-line)]"
          : "bg-transparent"
      }`}
      style={{ height: "var(--header-h)" }}
    >
      <nav className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="display shrink-0 text-lg tracking-tight text-[var(--agency-fg)] sm:text-xl"
        >
          {siteName ?? "◆"}
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {items.map((i) => (
            <li key={i.slug}>
              <button
                onClick={() => go(i.slug)}
                aria-current={active === i.slug ? "true" : undefined}
                className={`display px-3 py-2 text-sm transition-opacity ${
                  active === i.slug
                    ? "text-[var(--agency-fg)] opacity-100"
                    : "text-[var(--agency-muted)] opacity-80 hover:opacity-100"
                }`}
              >
                {i.name}
              </button>
            </li>
          ))}
        </ul>

        <a
          href={`tel:+351${contactPhone.replace(/\s/g, "")}`}
          className="hidden shrink-0 text-right text-[11px] leading-tight text-[var(--agency-muted)] lg:block"
        >
          BOOKING
          <br />
          <span className="text-[var(--agency-fg)]">
            {contactPhone} · {contactName}
          </span>
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="display text-sm text-[var(--agency-fg)] md:hidden"
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--agency-line)] bg-[var(--agency-bg)] px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {items.map((i) => (
              <li key={i.slug}>
                <button
                  onClick={() => go(i.slug)}
                  className={`display block w-full py-3 text-left text-xl ${
                    active === i.slug ? "text-[var(--agency-fg)]" : "text-[var(--agency-muted)]"
                  }`}
                >
                  {i.name}
                </button>
              </li>
            ))}
          </ul>
          <a
            href={`tel:+351${contactPhone.replace(/\s/g, "")}`}
            className="mt-3 block text-xs text-[var(--agency-muted)]"
          >
            BOOKING: {contactPhone} · {contactName}
          </a>
        </div>
      )}
    </header>
  );
}
