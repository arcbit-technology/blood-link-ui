/**
 * Geometry for the image cropper. The viewport (crop frame) is W×H CSS
 * pixels; the image is scaled to cover it at zoom 1, can be zoomed in,
 * rotated in 90° steps and moved, but never leaves a gap in the frame.
 */

export type CropState = {
  zoom: number; // 1 = image just covers the frame
  rotation: 0 | 90 | 180 | 270;
  x: number; // offset of the image centre from the frame centre (CSS px)
  y: number;
};

export const INITIAL_CROP: CropState = { zoom: 1, rotation: 0, x: 0, y: 0 };
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

type Size = { width: number; height: number };

/** Image size after rotation. */
export function rotatedSize(img: Size, rotation: number): Size {
  return rotation % 180 === 0 ? img : { width: img.height, height: img.width };
}

/** Scale (CSS px per image px) for the zoom level. */
export function scaleFor(img: Size, frame: Size, crop: Pick<CropState, "zoom" | "rotation">): number {
  const r = rotatedSize(img, crop.rotation);
  return Math.max(frame.width / r.width, frame.height / r.height) * crop.zoom;
}

/** Keeps zoom in range and the image covering the frame. */
export function clampCrop(img: Size, frame: Size, crop: CropState): CropState {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, crop.zoom));
  const s = scaleFor(img, frame, { zoom, rotation: crop.rotation });
  const r = rotatedSize(img, crop.rotation);
  const maxX = Math.max(0, (r.width * s - frame.width) / 2);
  const maxY = Math.max(0, (r.height * s - frame.height) / 2);
  return {
    zoom,
    rotation: crop.rotation,
    x: Math.min(maxX, Math.max(-maxX, crop.x)),
    y: Math.min(maxY, Math.max(-maxY, crop.y)),
  };
}

/** Zooms around a point of the frame (relative to its centre) so that point stays put. */
export function zoomAt(img: Size, frame: Size, crop: CropState, nextZoom: number, px = 0, py = 0): CropState {
  const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
  const k = z / crop.zoom;
  return clampCrop(img, frame, { ...crop, zoom: z, x: px - (px - crop.x) * k, y: py - (py - crop.y) * k });
}

/** Draws the framed area into a canvas of the output size. */
export function drawCrop(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  image: Size,
  frame: Size,
  crop: CropState,
  out: Size,
) {
  const k = out.width / frame.width; // frame px -> output px
  const s = scaleFor(image, frame, crop) * k;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(out.width / 2 + crop.x * k, out.height / 2 + crop.y * k);
  ctx.rotate((crop.rotation * Math.PI) / 180);
  ctx.drawImage(source, (-image.width * s) / 2, (-image.height * s) / 2, image.width * s, image.height * s);
  ctx.restore();
}

/** Renders the crop to a WebP (or JPEG where WebP encoding is unsupported) blob. */
export async function exportCrop(image: HTMLImageElement, frame: Size, crop: CropState, out: Size): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  drawCrop(ctx, image, { width: image.naturalWidth, height: image.naturalHeight }, frame, crop, out);

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("Could not encode the image");
  return jpeg;
}
