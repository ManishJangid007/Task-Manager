import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className }: BadgeProps) {
  if (count === 0) return null;

  // Format count to handle up to 3 digits, show 999+ if exceeds
  const displayCount = count > 999 ? '999+' : count.toString();
  
  // Adjust padding for 3-digit numbers
  const paddingClass = count > 99 ? "px-2" : count > 9 ? "px-1.5" : "px-1.5";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-5",
        paddingClass,
        "text-xs font-semibold",
        "rounded-full",
        "bg-primary text-primary-foreground",
        "whitespace-nowrap",
        className
      )}
    >
      {displayCount}
    </span>
  )
}

