import Image from "next/image";
import type { GalleryPhoto, ProjectTheme } from "@/lib/types";
import { placeholderStyle } from "@/lib/theme";
import { RevealOnScroll } from "./RevealOnScroll";

/** Loose grid of tilted, white-bordered snapshots (reference PDF pages 2 & 6). */
export function Gallery({
  photos,
  theme,
  projectName,
}: {
  photos: GalleryPhoto[];
  theme: ProjectTheme;
  projectName: string;
}) {
  if (photos.length === 0) return null;
  const tilt = [-2.5, 1.8, -1.2, 2.4, -2, 1.4, -1.6, 2.2];

  return (
    <RevealOnScroll className="mt-12 sm:mt-16">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {photos.map((p, i) => (
          <li
            key={i}
            className="group relative aspect-[3/4] overflow-hidden border-[6px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:!rotate-0 hover:scale-[1.02]"
            style={{ rotate: `${tilt[i % tilt.length]}deg` }}
          >
            {p.image ? (
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover object-top"
                loading="lazy"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={placeholderStyle(theme, i)}
                aria-label={p.alt || `${projectName} — fotografia por adicionar`}
              >
                <span className="display text-xs text-[var(--text)] opacity-60">
                  FOTO {i + 1}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </RevealOnScroll>
  );
}
