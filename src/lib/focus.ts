import type { CSSProperties } from "react";

/** Focal point (0..1, fraction of the image) + zoom (1 = fit, up to 3 = tight crop). */
export interface Focus {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_FOCUS: Focus = { x: 0.5, y: 0.5, zoom: 1 };
export const MAX_ZOOM = 3;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Parses the "x,y,zoom" string stored in the DB. Never throws. */
export function parseFocus(raw: string | null | undefined): Focus {
  if (!raw) return DEFAULT_FOCUS;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return DEFAULT_FOCUS;
  const [x, y, zoom] = parts;
  return { x: clamp(x, 0, 1), y: clamp(y, 0, 1), zoom: clamp(zoom, 1, MAX_ZOOM) };
}

export function serializeFocus(f: Focus): string {
  return `${f.x.toFixed(4)},${f.y.toFixed(4)},${f.zoom.toFixed(3)}`;
}

/**
 * CSS for an `object-fit: cover` image/video inside a fixed-size box, applying
 * the stored focal point + zoom. Works with both <img>/<Image fill> and
 * <video>: pair with `object-fit: cover` and `overflow: hidden` on the box.
 */
export function focusStyle(raw: string | null | undefined): CSSProperties {
  const f = parseFocus(raw);
  const pos = `${(f.x * 100).toFixed(2)}% ${(f.y * 100).toFixed(2)}%`;
  return {
    objectPosition: pos,
    transform: f.zoom > 1 ? `scale(${f.zoom})` : undefined,
    transformOrigin: pos,
  };
}
