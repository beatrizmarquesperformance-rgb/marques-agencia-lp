import type { Social } from "@/lib/types";

const LABEL: Record<Social["platform"], string> = {
  instagram: "INSTAGRAM",
  tiktok: "TIKTOK",
  facebook: "FACEBOOK",
  youtube: "YOUTUBE",
  website: "WEBSITE",
};

/** Hand-drawn-arrow social links, matching the reference PDF. Renders nothing when empty. */
export function SocialLinks({ socials }: { socials: Social[] }) {
  const valid = socials.filter((s) => s.url && s.url.trim().length > 3);
  if (valid.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {valid.map((s) => (
        <li key={s.platform + s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="display inline-flex items-center gap-2 text-sm text-[var(--text)] transition-transform hover:translate-x-1"
          >
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
              <path
                d="M1 6h21M17 1l6 5-6 5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {LABEL[s.platform]}
          </a>
        </li>
      ))}
    </ul>
  );
}
