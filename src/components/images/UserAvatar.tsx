"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cld, initials } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  /** Rendered size in CSS px. */
  size?: number;
  className?: string;
  bloodGroup?: string;
}

/** Round profile photo (Cloudinary, face-centred) with an initials fallback and an optional blood group tag. */
export function UserAvatar({ src, name, size = 40, className, bloodGroup }: UserAvatarProps) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <Avatar className={cn("h-full w-full", className)}>
        {src && (
          <AvatarImage
            src={cld(src, { w: size * 2, h: size * 2, gravity: "face" })}
            alt={name ?? ""}
            className="object-cover"
            loading="lazy"
          />
        )}
        <AvatarFallback
          className="blood-gradient font-semibold text-blood-foreground"
          style={{ fontSize: Math.max(10, size * 0.38) }}
        >
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {bloodGroup && (
        <span
          className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground"
          aria-label={bloodGroup}
        >
          {bloodGroup}
        </span>
      )}
    </span>
  );
}
