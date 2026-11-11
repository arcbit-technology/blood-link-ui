import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  actions?: ReactNode;
  className?: string;
}

/** Page title block shared by inner pages – gradient icon tile, accent bar, optional actions. */
export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="icon-tile h-14 w-14 rounded-2xl">
            <Icon className="h-7 w-7" />
          </span>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
          <span aria-hidden="true" className="mt-2 mb-3 block h-1 w-14 rounded-full blood-gradient" />
          {subtitle && <p className="text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
