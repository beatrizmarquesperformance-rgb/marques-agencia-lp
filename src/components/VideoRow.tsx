import type { Video } from "@/lib/types";
import { LazyVideo } from "./LazyVideo";

/**
 * Watchable clips for a project section (the aftermovies are vertical).
 * Nothing loads until the poster is clicked.
 */
export function VideoRow({ videos }: { videos: Video[] }) {
  const valid = videos.filter((v) => v.src && v.src.trim().length > 0);
  if (valid.length === 0) return null;

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-4">
      {valid.map((v, i) => (
        <figure
          key={i}
          className="w-[min(280px,72vw)] overflow-hidden border-[6px] border-white bg-black"
        >
          <LazyVideo
            provider={v.provider}
            src={v.src}
            poster={v.poster}
            mode="click"
            label={v.title}
            posterSizes="280px"
            className="aspect-[9/16]"
          />
          {v.title && (
            <figcaption className="display bg-black px-3 py-2 text-xs text-white">
              {v.title}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
