"use client";

import { useRef, useState } from "react";
import { DEFAULT_FOCUS, MAX_ZOOM, parseFocus, serializeFocus, type Focus } from "@/lib/focus";

/**
 * Drag-to-pan + slider-to-zoom focal point editor. Shown next to an
 * ImageField/MediaInput once an image is picked. Renders a hidden input
 * (name) carrying the serialized "x,y,zoom" so it submits with the rest of
 * the form, same pattern as every other admin field here.
 */
export function FocusEditor({
  name,
  imageUrl,
  defaultValue,
  aspect = "3 / 4",
}: {
  name: string;
  imageUrl: string;
  defaultValue?: string;
  aspect?: string;
}) {
  const [focus, setFocus] = useState<Focus>(() => parseFocus(defaultValue));
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ startX: number; startY: number; origin: Focus } | null>(null);

  if (!imageUrl) return null;

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragging.current = { startX: e.clientX, startY: e.clientY, origin: focus };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragging.current;
    const box = boxRef.current;
    if (!drag || !box) return;
    const rect = box.getBoundingClientRect();
    // divide by zoom so panning feels consistent at any zoom level
    const dx = (e.clientX - drag.startX) / (rect.width * drag.origin.zoom);
    const dy = (e.clientY - drag.startY) / (rect.height * drag.origin.zoom);
    setFocus({
      ...drag.origin,
      x: Math.min(1, Math.max(0, drag.origin.x - dx)),
      y: Math.min(1, Math.max(0, drag.origin.y - dy)),
    });
  }

  function onPointerUp() {
    dragging.current = null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative w-32 shrink-0 cursor-grab overflow-hidden border border-neutral-700 active:cursor-grabbing"
        style={{ aspectRatio: aspect, touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          style={{
            objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
            transform: focus.zoom > 1 ? `scale(${focus.zoom})` : undefined,
            transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 border border-white/20" />
      </div>
      <input
        type="range"
        min={1}
        max={MAX_ZOOM}
        step={0.05}
        value={focus.zoom}
        onChange={(e) => setFocus((f) => ({ ...f, zoom: Number(e.target.value) }))}
        className="w-32"
        aria-label="Zoom"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-500">arrasta para mover · zoom {focus.zoom.toFixed(2)}×</span>
        <button
          type="button"
          onClick={() => setFocus(DEFAULT_FOCUS)}
          className="text-[10px] text-neutral-500 underline hover:text-white"
        >
          repor
        </button>
      </div>
      <input type="hidden" name={name} value={serializeFocus(focus)} />
    </div>
  );
}
