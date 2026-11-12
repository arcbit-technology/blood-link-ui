"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUploadDialog, type ImagePreset } from "@/components/images/ImageUploadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { removeImage, type ImageSlot } from "@/api/images";
import { apiErrorMessage } from "@/lib/apiErrors";
import { cn } from "@/lib/utils";

interface ImageSlotMenuProps {
  slot: ImageSlot;
  preset: ImagePreset;
  hasImage: boolean;
  /** Dialog title and the button's accessible name. */
  label: string;
  description?: string;
  /** Called with the new URL ("" after removal). */
  onChange: (url: string) => void;
  /** Custom trigger content; defaults to a round camera button. */
  children?: ReactNode;
  className?: string;
}

/** Camera button → "Upload new" (crop dialog) / "Remove" for one image slot. */
export function ImageSlotMenu({ slot, preset, hasImage, label, description, onChange, children, className }: ImageSlotMenuProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const remove = async () => {
    if (!token) return;
    setRemoving(true);
    try {
      await removeImage(slot, token);
      onChange("");
      toast({ title: t("images.removed") });
    } catch (e) {
      toast({ title: apiErrorMessage(e, t), variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  const trigger = children ?? (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      aria-label={label}
      className={cn("h-9 w-9 rounded-full border-2 border-card shadow-md", className)}
    >
      {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
    </Button>
  );

  return (
    <>
      {hasImage ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <ImagePlus className="mr-2 h-4 w-4" />
              {t("images.uploadNew")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmRemove(true)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t("images.remove")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span onClickCapture={() => setDialogOpen(true)} className="contents">
          {trigger}
        </span>
      )}

      <ImageUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slot={slot}
        preset={preset}
        title={label}
        description={description}
        onUploaded={onChange}
      />

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("images.removeConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("images.removeConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bloodBanks.manage.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t("images.remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
