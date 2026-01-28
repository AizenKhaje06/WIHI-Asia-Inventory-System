"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ShimmerSkeletonProps {
  className?: string
  variant?: "default" | "card" | "chart" | "text"
}

export function ShimmerSkeleton({ 
  className, 
  variant = "default" 
}: ShimmerSkeletonProps) {
  const baseStyles = "relative overflow-hidden"
  
  if (variant === "card") {
    return (
      <div className={cn(baseStyles, "rounded-[5px]", className)}>
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] 
          bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
      </div>
    )
  }
  
  if (variant === "chart") {
    return (
      <div className={cn(baseStyles, "space-y-4", className)}>
        <Skeleton className="h-4 w-3/4" />
        <div className="h-64 rounded-[5px] relative overflow-hidden">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] 
            bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(baseStyles, className)}>
      <Skeleton className={className} />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] 
        bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
    </div>
  )
}

