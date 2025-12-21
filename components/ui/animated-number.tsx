"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
  enabled?: boolean
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  className,
  enabled = true
}: AnimatedNumberProps) {
  const count = useCountUp(value, duration, 0, enabled)
  
  const formattedValue = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString()
  
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{formattedValue}{suffix}
    </span>
  )
}

