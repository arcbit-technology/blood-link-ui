"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, RotateCcw, RotateCw, Undo2, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ImageCropper } from "@/components/images/ImageCropper";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, UploadError, type ImageSlot } from "@/api/images";
import { apiErrorMessage } from "@/lib/apiErrors";
import { clampCrop, exportCrop, INITIAL_CROP, MAX_ZOOM, MIN_ZOOM, zoomAt, type CropState } from "@/lib/imageCrop";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export type ImagePreset = {
  aspect: number;
  shape: "circle" | "rect";
  output: { width: number; height: number };
};

export const IMAGE_PRESETS = {
  avatar: { aspect: 1, shape: "circle", output: { width: 640, height: 640 } },
  logo: { aspect: 1, shape: "rect", output: { width: 512, height: 512 } },
  cover: { aspect: 16 / 5, shape: "rect", output: { width: 1600, height: 500 } },
} satisfies Record<string, ImagePreset>;

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ImageSlot;
  preset: ImagePreset;
  title: string;
  description?: string;
  /** Called with the stored image URL after a successful upload. */
  onUploaded: (url: string) => void;
}

/** Pick (drop / click / paste) → adjust (move, zoom, rotate) → upload with progress. */
export function ImageUploadDialog({ open, onOpenChange, slot, preset, title, description, onUploaded }: ImageUploadDialogProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const imageRef = useRef<{ img: HTMLImageElement; frame: () => { width: number; height: number } } | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropState>(INITIAL_CROP);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [smallImage, setSmallImage] = useState(false);

  const reset = useCallback(() => {
    setSrc((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setCrop(INITIAL_CROP);
    setProgress(null);
    setSmallImage(false);
    imageRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      reset();
    }
  }, [open, reset]);

  const pickFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        toast({ title: t("images.errors.type"), variant: "destructive" });
        return;
      }
      if (file.size > MAX_INPUT_BYTES) {
        toast({ title: t("images.errors.size", { mb: 15 }), variant: "destructive" });
        return;
      }
      setSrc((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(file);
      });
      setCrop(INITIAL_CROP);
      setSmallImage(false);
    },
    [t, toast],
  );

  // paste an image from the clipboard while the dialog is open
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) pickFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, pickFile]);

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const onReady = useCallback(
    (img: HTMLImageElement, frame: () => { width: number; height: number }) => {
      imageRef.current = { img, frame };
      setSmallImage(img.naturalWidth < preset.output.width / 2 || img.naturalHeight < preset.output.height / 2);
    },
    [preset.output.width, preset.output.height],
  );

  const natural = () => {
    const img = imageRef.current?.img;
    return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
  };

  const setZoom = (zoom: number) => {
    const n = natural();
    const f = imageRef.current?.frame();
    if (n && f) setCrop((c) => zoomAt(n, f, c, zoom));
  };

  const rotate = (dir: 1 | -1) => {
    const n = natural();
    const f = imageRef.current?.frame();
    setCrop((c) => {
      const rotation = (((c.rotation + dir * 90) % 360) + 360) % 360 as CropState["rotation"];
      const next = { ...c, rotation, x: 0, y: 0 };
      return n && f ? clampCrop(n, f, next) : next;
    });
  };

  const save = async () => {
    const ref = imageRef.current;
    if (!ref || !token) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);
    try {
      const blob = await exportCrop(ref.img, ref.frame(), crop, preset.output);
      const url = await uploadImage(slot, blob, token, setProgress, controller.signal);
      onUploaded(url);
      toast({ title: t("images.saved") });
      onOpenChange(false);
    } catch (e) {
      if (controller.signal.aborted) return;
      toast({
        title: e instanceof UploadError ? t("images.errors.upload") : apiErrorMessage(e, t),
        description: e instanceof UploadError ? e.message : undefined,
        variant: "destructive",
      });
      setProgress(null);
    }
  };

  const uploading = progress !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => !uploading && onOpenChange(o)}>
      <DialogContent className={cn("max-h-[95vh] overflow-y-auto", preset.aspect > 1.5 ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {!src ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{ aspectRatio: String(Math.max(preset.aspect, 1.4)) }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
              dragOver ? "border-primary bg-primary/10" : "border-primary/25 hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <span className="icon-tile h-14 w-14 rounded-2xl">
              <ImagePlus className="h-7 w-7" />
            </span>
            <span className="font-semibold">{t("images.dropTitle")}</span>
            <span className="text-sm text-muted-foreground">{t("images.dropHint")}</span>
          </button>
        ) : (
          <div className="space-y-4">
            <ImageCropper
              src={src}
              aspect={preset.aspect}
              shape={preset.shape}
              crop={crop}
              onCropChange={setCrop}
              onReady={onReady}
            />
            <p className="text-center text-xs text-muted-foreground">{t("images.cropperHint")}</p>
            {smallImage && <p className="text-center text-xs text-amber-700 dark:text-amber-300">{t("images.smallWarning")}</p>}

            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Slider
                value={[crop.zoom]}
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                onValueChange={([z]) => setZoom(z)}
                aria-label={t("images.zoom")}
                disabled={uploading}
              />
              <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => rotate(-1)} disabled={uploading}>
                <RotateCcw className="mr-1 h-4 w-4" />
                {t("images.rotateLeft")}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => rotate(1)} disabled={uploading}>
                <RotateCw className="mr-1 h-4 w-4" />
                {t("images.rotateRight")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCrop(INITIAL_CROP)} disabled={uploading}>
                <Undo2 className="mr-1 h-4 w-4" />
                {t("images.reset")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                <ImagePlus className="mr-1 h-4 w-4" />
                {t("images.another")}
              </Button>
            </div>

            {uploading && (
              <div className="space-y-1" aria-live="polite">
                <Progress value={Math.round((progress ?? 0) * 100)} />
                <p className="text-center text-xs text-muted-foreground">
                  {(progress ?? 0) < 1
                    ? t("images.uploading", { percent: Math.round((progress ?? 0) * 100) })
                    : t("images.finishing")}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            {t("bloodBanks.manage.cancel")}
          </Button>
          <Button
            onClick={save}
            disabled={!src || uploading}
            className="blood-gradient text-blood-foreground"
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {t("images.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
