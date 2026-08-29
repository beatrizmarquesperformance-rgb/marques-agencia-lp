"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { VideoProvider } from "@/lib/types";
import { embedSrc, nativeSrc, usesIframe } from "@/lib/video";

type Mode = "background" | "click";

/**
 * One video primitive for the whole site.
 *  - "background": muted, looping, autoplays only while on screen (IntersectionObserver),
 *    pauses off screen. Reduced motion → stays on the poster.
 *  - "click": poster + play button; loads and plays with controls on demand.
 * Always shows the poster first + a loading state until the media is ready, so there
 * is no layout shift (the wrapper owns the aspect ratio).
 */
export function LazyVideo({
  provider,
  src,
  poster,
  mode = "background",
  className = "",
  label,
  fit = "cover",
}: {
  provider: VideoProvider;
  src: string | null;
  poster: string | null;
  mode?: Mode;
  className?: string;
  label?: string;
  fit?: "cover" | "contain";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false); // user asked to play (click mode)
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const iframe = usesIframe(provider);
  const shouldPlay =
    mode === "click" ? active : inView && !reduced && Boolean(src);

  // native <video> play/pause follows visibility in background mode
  useEffect(() => {
    const v = videoRef.current;
    if (!v || iframe) return;
    if (shouldPlay) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [shouldPlay, iframe]);

  const showPoster = !ready || (mode === "click" && !active);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-neutral-900 ${className}`}
    >
      {/* Poster + loading layer */}
      {(showPoster || !src) && (
        <div className="absolute inset-0">
          {poster ? (
            <Image
              src={poster}
              alt={label ?? ""}
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className={fit === "cover" ? "object-cover" : "object-contain"}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(140deg,#1b1b1e,#0d0d0f)]" />
          )}
          {src && !ready && shouldPlay && (
            <span className="absolute bottom-3 right-3 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
        </div>
      )}

      {/* Media */}
      {src && shouldPlay && iframe && (
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
          onLoad={() => setReady(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {src && shouldPlay && !iframe && (
        <video
          ref={videoRef}
          src={nativeSrc({ provider, src }, mode === "click" ? "high" : "medium")}
          poster={poster ?? undefined}
          muted={mode === "background"}
          loop={mode === "background"}
          controls={mode === "click"}
          playsInline
          preload="metadata"
          onLoadedData={() => setReady(true)}
          className={`absolute inset-0 h-full w-full ${
            fit === "cover" ? "object-cover" : "object-contain"
          }`}
        />
      )}

      {/* Click-to-play affordance */}
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
