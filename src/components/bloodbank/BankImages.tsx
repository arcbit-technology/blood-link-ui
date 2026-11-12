"use client";

import { Droplet } from "lucide-react";
import { cld } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

/** Blood bank logo (Cloudinary) or the droplet tile when there is none. */
export function BankLogo({
  logo,
  name,
  size = 48,
  className,
}: {
  logo?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes and optimises (f_auto, q_auto)
      <img
        src={cld(logo, { w: size * 2, h: size * 2 })}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={cn("shrink-0 rounded-2xl bg-card object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className={cn("icon-tile shrink-0 rounded-2xl", className)} style={{ width: size, height: size }}>
      <Droplet style={{ width: size / 2, height: size / 2 }} />
    </span>
  );
}

/** Blood bank cover photo with a soft fade, or the brand gradient. */
export function BankCover({ cover, className, width = 1600 }: { cover?: string; className?: string; width?: number }) {
  return (
    <div className={cn("relative isolate overflow-hidden blood-gradient", className)}>
      {cover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes and optimises (f_auto, q_auto) */}
          <img
            src={cld(cover, { w: width, h: Math.round(width / 3.2) })}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        </>
      ) : (
        <>
          <div aria-hidden="true" className="absolute -right-10 -top-16 -z-10 h-48 w-48 rounded-full border-[30px] border-white/10" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(rgb(255_255_255/0.35)_1px,transparent_1px)] [background-size:18px_18px]"
          />
        </>
      )}
    </div>
  );
}
