import Image from "next/image";
import lightLogo from "../../public/logo-light.png";
import darkLogo from "../../public/logo-dark.png";
import { cn } from "@/lib/utils";

// The adjacent translated app name labels the brand; the mark is decorative.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-12 w-12 shrink-0", className)}>
      <Image
        src={lightLogo}
        alt=""
        fill
        sizes="64px"
        className="object-contain dark:hidden"
      />
      <Image
        src={darkLogo}
        alt=""
        fill
        sizes="64px"
        className="hidden object-contain dark:block"
      />
    </span>
  );
}
