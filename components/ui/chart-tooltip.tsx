"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/utils"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    color?: string
    dataKey?: string
    payload?: any
  }>
  label?: string
  formatter?: (value: number | string, name: string) => [string, string]
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border 
      border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200
      min-w-[200px]">
      {label && (
        <p className="font-semibold mb-3 text-slate-900 dark:text-slate-100 border-b 
          border-slate-200 dark:border-slate-700 pb-2">
          {label}
        </p>
      )}
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const value = entry.value ?? 0
          const name = entry.name || entry.dataKey || 'Value'
          const color = entry.color || 'hsl(var(--primary))'
          
          const [formattedValue, formattedName] = formatter
            ? formatter(typeof value === 'number' ? value : parseFloat(String(value)) || 0, name)
            : [`₱${formatNumber(typeof value === 'number' ? value : parseFloat(String(value)) || 0)}`, name]
          
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formattedName}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

