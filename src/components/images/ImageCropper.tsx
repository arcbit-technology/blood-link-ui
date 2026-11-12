"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { clampCrop, scaleFor, zoomAt, type CropState } from "@/lib/imageCrop";

type Size = { width: number; height: number };

interface ImageCropperProps {
  src: string;
  /** Frame width / height. */
  aspect: number;
  shape: "circle" | "rect";
  crop: CropState;
  onCropChange: (crop: CropState) => void;
  /** Called once the image is decoded, with getters used at export time. */
  onReady: (image: HTMLImageElement, frameSize: () => Size) => void;
}

/**
 * Drag to move, scroll / pinch / +− to zoom, arrow keys to nudge. The image
 * always covers the frame (see lib/imageCrop).
 */
export function ImageCropper({ src, aspect, shape, crop, onCropChange, onReady }: ImageCropperProps) {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<Size | null>(null);
  const [frame, setFrame] = useState<Size>({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ crop: CropState; x: number; y: number; dist: number } | null>(null);
  const cropRef = useRef(crop);
  cropRef.current = crop;

  const frameSize = useCallback((): Size => {
    const el = frameRef.current;
    return el ? { width: el.clientWidth, height: el.clientHeight } : frame;
  }, [frame]);

  // track the frame size (responsive dialog)
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setFrame({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // keep the crop valid when the frame or image changes
  useEffect(() => {
    if (!natural || !frame.width) return;
    const next = clampCrop(natural, frame, cropRef.current);
    if (next.x !== cropRef.current.x || next.y !== cropRef.current.y || next.zoom !== cropRef.current.zoom) {
      onCropChange(next);
    }
  }, [natural, frame, crop.rotation, onCropChange]);

  // wheel zoom needs a non-passive listener to stop the page scrolling
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !natural) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const size = { width: rect.width, height: rect.height };
      const px = e.clientX - rect.left - rect.width / 2;
      const py = e.clientY - rect.top - rect.height / 2;
      const c = cropRef.current;
      onCropChange(zoomAt(natural, size, c, c.zoom * Math.exp(-e.deltaY * 0.0015), px, py));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [natural, onCropChange]);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const center = () => {
    const pts = [...pointers.current.values()];
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  };
  const startGesture = () => {
    const c = center();
    gesture.current = { crop: cropRef.current, x: c.x, y: c.y, dist: distance() };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current || !natural) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const c = center();
    let next: CropState = { ...g.crop, x: g.crop.x + (c.x - g.x), y: g.crop.y + (c.y - g.y) };
    if (pointers.current.size >= 2 && g.dist > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      next = zoomAt(
        natural,
        frameSize(),
        next,
        g.crop.zoom * (distance() / g.dist),
        c.x - rect.left - rect.width / 2,
        c.y - rect.top - rect.height / 2,
      );
    }
    onCropChange(clampCrop(natural, frameSize(), next));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) startGesture();
    else {
      gesture.current = null;
      setDragging(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!natural) return;
    const step = e.shiftKey ? 40 : 10;
    const c = cropRef.current;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      onCropChange(clampCrop(natural, frameSize(), { ...c, x: c.x + dx, y: c.y + dy }));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      onCropChange(zoomAt(natural, frameSize(), c, c.zoom * 1.1));
    } else if (e.key === "-") {
      e.preventDefault();
      onCropChange(zoomAt(natural, frameSize(), c, c.zoom / 1.1));
    }
  };

  const s = natural && frame.width ? scaleFor(natural, frame, crop) : 0;

  return (
    <div
      ref={frameRef}
      role="application"
      tabIndex={0}
      aria-label={t("images.cropperHint")}
      style={{ aspectRatio: String(aspect) }}
      className={cn(
        "relative w-full touch-none select-none overflow-hidden rounded-xl bg-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, measured and drawn to canvas */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          setNatural({ width: img.naturalWidth, height: img.naturalHeight });
          onReady(img, frameSize);
        }}
        className={cn("pointer-events-none absolute left-1/2 top-1/2 max-w-none", !dragging && "transition-transform duration-150")}
        style={
          natural
            ? {
                width: natural.width * s,
                height: natural.height * s,
                transform: `translate(-50%, -50%) translate(${crop.x}px, ${crop.y}px) rotate(${crop.rotation}deg)`,
              }
            : { opacity: 0 }
        }
      />

      {/* crop guide */}
      {shape === "circle" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80"
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-inset ring-white/70" />
      )}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity",
          dragging ? "opacity-100" : "opacity-0",
          "[background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:33.333%_33.333%] [background-position:-1px_-1px]",
        )}
      />
    </div>
  );
}
