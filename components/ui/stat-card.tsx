/**
 * Clean Stat Card Component with Hover Tilt Effect
 * 
 * Features:
 * - Pure white background (no gradients or colors)
 * - Subtle shadow
 * - Smooth hover tilt animation
 * - Keeps colored text and icons for clarity
 */

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: ReactNode
  icon?: LucideIcon
  iconColor?: string
  description?: string
  badge?: ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600 dark:text-blue-400",
  description,
  badge,
  className
}: StatCardProps) {
  return (
    <div
      className={cn(
        // Clean white card
        "bg-white dark:bg-slate-900",
        "rounded-xl",
        // Subtle shadow
        "shadow-sm",
        // Border for definition
        "border border-slate-200 dark:border-slate-800",
        // Smooth transitions
        "transition-all duration-300 ease-out",
        // Hover effects
        "hover:shadow-lg hover:-translate-y-1",
        // Tilt effect on hover (3D transform)
        "transform-gpu perspective-1000",
        "hover:rotate-x-2 hover:rotate-y-2",
        // Padding
        "p-6",
        // Cursor
        "cursor-default",
        className
      )}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-slate-50 dark:bg-slate-800", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        {badge && <div>{badge}</div>}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {value}
      </div>

      {/* Title */}
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {title}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {description}
        </div>
      )}
    </div>
  )
}
