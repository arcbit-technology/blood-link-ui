import { cn } from "@/lib/utils";
import { BloodGroup } from "@/types";

interface BloodBadgeProps {
  bloodGroup: BloodGroup;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-28 h-28 text-4xl'
};

export function BloodBadge({ bloodGroup, size = 'md', animated = false, className }: BloodBadgeProps) {
  return (
    <div
      className={cn(
        "blood-badge-gradient rounded-full flex items-center justify-center text-blood-foreground font-bold shadow-lg",
        sizeClasses[size],
        animated && "animate-pulse-blood",
        className
      )}
    >
      <span className="drop-shadow-sm">{bloodGroup}</span>
    </div>
  );
}
