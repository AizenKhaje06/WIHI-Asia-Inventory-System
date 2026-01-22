"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface EnhancedCardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  title?: string
  icon?: ReactNode
  delay?: number
  variant?: "default" | "gradient" | "glass"
}

export function EnhancedCard({
  children,
  className,
  header,
  title,
  icon,
  delay = 0,
  variant = "default"
}: EnhancedCardProps) {
  const baseStyles = cn(
    "group relative overflow-hidden rounded-lg border-0 shadow-lg",
    "transition-all duration-300",
    "hover:scale-[1.02] hover:shadow-2xl",
    "animate-in fade-in-0 slide-in-from-bottom-4 duration-700",
    variant === "glass" && "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20",
    variant === "gradient" && "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800",
    variant === "default" && "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
    "dark:card-neon",
    "before:absolute before:inset-0 before:bg-gradient-to-br",
    "before:from-blue-500/0 before:to-purple-500/0",
    "before:transition-opacity before:duration-300",
    "hover:before:from-blue-500/10 hover:before:to-purple-500/10",
    "dark:hover:shadow-lg dark:hover:shadow-primary/20",
    className
  )

  return (
    <Card 
      className={baseStyles}
      style={{ animationDelay: `${delay}ms` }}
    >
      {(header || title) && (
        <CardHeader className="pb-4">
          {header || (
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              {icon && (
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  {icon}
                </div>
              )}
              {title}
            </CardTitle>
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

