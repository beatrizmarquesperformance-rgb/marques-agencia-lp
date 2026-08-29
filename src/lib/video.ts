import type { VideoProvider } from "@/lib/types";

export interface VideoSource {
  provider: VideoProvider;
  src: string;
}

/** True when the provider plays through a native <video> element. */
export function isNativeVideo(provider: VideoProvider): boolean {
  return provider === "mp4" || provider === "mux" || provider === "cloudflare";
}

/** URL for a native <video> src. `quality` only affects Mux static renditions. */
export function nativeSrc(
  { provider, src }: VideoSource,
  quality: "low" | "medium" | "high" = "medium",
): string {
  switch (provider) {
    case "mux":
      // requires MP4 support / static renditions enabled on the asset
      return `https://stream.mux.com/${src}/${quality}.mp4`;
    case "cloudflare":
      return `https://videodelivery.net/${src}/downloads/default.mp4`;
    default:
      return src; // mp4 — a direct URL (Vercel Blob, CDN, …)
  }
}

/** URL for an <iframe> embed (YouTube / Vimeo, or Cloudflare Stream player). */
export function embedSrc(
  { provider, src }: VideoSource,
  opts: { autoplay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean } = {},
): string {
  const { autoplay = false, muted = false, loop = false, controls = true } = opts;
  switch (provider) {
    case "youtube": {
      const p = new URLSearchParams({
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
        autoplay: autoplay ? "1" : "0",
        mute: muted ? "1" : "0",
        controls: controls ? "1" : "0",
      });
      if (loop) {
        p.set("loop", "1");
        p.set("playlist", src);
      }
      return `https://www.youtube-nocookie.com/embed/${src}?${p}`;
    }
    case "vimeo": {
      const p = new URLSearchParams({
        autoplay: autoplay ? "1" : "0",
        muted: muted ? "1" : "0",
        loop: loop ? "1" : "0",
        controls: controls ? "1" : "0",
        playsinline: "1",
      });
      return `https://player.vimeo.com/video/${src}?${p}`;
    }
    case "cloudflare":
      return `https://iframe.videodelivery.net/${src}?autoplay=${autoplay}&muted=${muted}&loop=${loop}&controls=${controls}`;
    default:
      return src;
  }
}

export function usesIframe(provider: VideoProvider): boolean {
  return provider === "youtube" || provider === "vimeo";
}
