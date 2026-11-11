"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  className?: string;
  activeClassName?: string;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, end = false, ...props }, ref) => {
    const pathname = usePathname();
    const target = typeof href === "string" ? href.split(/[?#]/)[0] : href.pathname;
    const isActive = pathname === target ||
      (!end && target !== "/" && pathname.startsWith(`${target}/`));

    return (
      <Link
        {...props}
        ref={ref}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(className, isActive && activeClassName)}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
