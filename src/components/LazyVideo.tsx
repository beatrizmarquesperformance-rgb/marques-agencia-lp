"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { VideoProvider } from "@/lib/types";
import { embedSrc, nativeSrc, usesIframe } from "@/lib/video";

type Mode = "background" | "click";

/**
 * One video primitive for the whole site.
 *  - "background": muted, looping. Autoplays while on screen (or immediately
 *    when `eager`), pauses off screen. Reduced motion → stays on the poster.
 *  - "click": poster + play button; loads and plays with controls on demand.
 * The poster stays visible until the video is actually playing, so there is
 * no black flash and no layout shift (the wrapper owns the aspect ratio).
 */
export function LazyVideo({
  provider,
  src,
  poster,
  mode = "background",
  eager = false,
  className = "",
  label,
  fit = "cover",
  posterPriority = false,
  posterSizes = "(max-width: 768px) 90vw, 40vw",
}: {
  provider: VideoProvider;
  src: string | null;
  poster: string | null;
  mode?: Mode;
  eager?: boolean;
  className?: string;
  label?: string;
  fit?: "cover" | "contain";
  posterPriority?: boolean;
  posterSizes?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false); // user asked to play (click mode)
  const [inView, setInView] = useState(eager);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (eager) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  const iframe = usesIframe(provider);
  const wantVideo =
    mode === "click" ? active : (inView || eager) && !reduced && Boolean(src);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || iframe) return;
    if (wantVideo) {
      setLoading(true);
      v.play().catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [wantVideo, iframe]);

  const objectFit = fit === "cover" ? "object-cover" : "object-contain";
  const showPoster = mode === "click" ? !active : !playing;

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {(showPoster || !src) && (
        <div className="absolute inset-0">
          {poster ? (
            <Image
              src={poster}
              alt={label ?? ""}
              fill
              sizes={posterSizes}
              className={objectFit}
              priority={posterPriority}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(140deg,#1b1b1e,#0d0d0f)]" />
          )}
          {src && loading && !playing && wantVideo && (
            <span className="absolute bottom-3 right-3 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
        </div>
      )}

      {src && wantVideo && iframe && (
        <iframe
          src={embedSrc(
            { provider, src },
            mode === "click"
              ? { autoplay: true, controls: true }
              : { autoplay: true, muted: true, loop: true, controls: false },
          )}
          title={label ?? "Vídeo"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {src && wantVideo && !iframe && (
        <video
          ref={videoRef}
          src={nativeSrc({ provider, src }, mode === "click" ? "high" : "medium")}
          poster={poster ?? undefined}
          muted={mode === "background"}
          loop={mode === "background"}
          controls={mode === "click"}
          playsInline
          preload={eager ? "auto" : "metadata"}
          onPlaying={() => {
            setPlaying(true);
            setLoading(false);
          }}
          onWaiting={() => setLoading(true)}
          className={`absolute inset-0 h-full w-full ${objectFit}`}
        />
      )}

      {mode === "click" && !active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={label ? `Reproduzir: ${label}` : "Reproduzir vídeo"}
          className="group absolute inset-0 grid place-items-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="black" aria-hidden="true">
              <path d="M2 2l14 8-14 8z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
