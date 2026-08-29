"use client";

import { useState } from "react";
import Image from "next/image";
import type { Video } from "@/lib/types";

function embedUrl(v: Video): string | null {
  switch (v.provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${v.src}?autoplay=1&rel=0`;
    case "vimeo":
      return `https://player.vimeo.com/video/${v.src}?autoplay=1`;
    case "mux":
      return `https://stream.mux.com/${v.src}.m3u8`; // used as <video> src
    case "cloudflare":
      return `https://iframe.videodelivery.net/${v.src}?autoplay=true`;
    default:
      return v.src; // mp4
  }
}

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const url = embedUrl(video);
  const isIframe =
    video.provider === "youtube" ||
    video.provider === "vimeo" ||
    video.provider === "cloudflare";

  return (
    <figure className="relative aspect-video overflow-hidden border-[6px] border-white bg-black shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Reproduzir vídeo${video.title ? `: ${video.title}` : ""}`}
        >
          {video.poster ? (
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--secondary)]" />
          )}
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
            <svg width="22" height="24" viewBox="0 0 22 24" fill="black" aria-hidden="true">
              <path d="M2 2l18 10L2 22z" />
            </svg>
          </span>
          {video.title && (
            <figcaption className="display absolute bottom-2 left-3 text-xs text-white drop-shadow">
              {video.title}
            </figcaption>
          )}
        </button>
      )}

      {playing && url && isIframe && (
        <iframe
          src={url}
          title={video.title || "Vídeo"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}
      {playing && url && !isIframe && (
        <video
          src={url}
          poster={video.poster ?? undefined}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </figure>
  );
}

/** 2–4 videos, lazy: nothing loads until the poster is clicked. */
export function VideoRow({ videos }: { videos: Video[] }) {
  const valid = videos.filter((v) => v.src && v.src.trim().length > 0);
  if (valid.length === 0) return null;
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      {valid.map((v, i) => (
        <VideoCard key={i} video={v} />
      ))}
    </div>
  );
}
