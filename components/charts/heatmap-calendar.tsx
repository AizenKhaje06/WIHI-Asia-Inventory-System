"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface HeatmapData {
  date: string
  value: number
  label?: string
}

interface HeatmapCalendarProps {
  data: HeatmapData[]
  title?: string
  month: Date
}

export function HeatmapCalendar({ data, title = "Sales Heatmap", month }: HeatmapCalendarProps) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d.value]))
  const maxValue = Math.max(...data.map(d => d.value), 1)

  // Generate calendar grid
  const calendar: Array<{ day: number | null; value: number; date: string }> = []
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendar.push({ day: null, value: 0, date: '' })
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const value = dataMap.get(dateStr) || 0
    calendar.push({ day, value, date: dateStr })
  }

  // Get intensity color
  const getIntensityColor = (value: number) => {
    if (value === 0) return 'bg-slate-100 dark:bg-slate-800'
    const intensity = (value / maxValue) * 100
    if (intensity >= 80) return 'bg-emerald-600 dark:bg-emerald-500'
    if (intensity >= 60) return 'bg-emerald-500 dark:bg-emerald-600'
    if (intensity >= 40) return 'bg-emerald-400 dark:bg-emerald-700'
    if (intensity >= 20) return 'bg-emerald-300 dark:bg-emerald-800'
    return 'bg-emerald-200 dark:bg-emerald-900'
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const totalSales = data.reduce((sum, d) => sum + d.value, 0)
  const avgDailySales = data.length > 0 ? totalSales / data.length : 0
  const peakDay = data.reduce((max, d) => d.value > max.value ? d : max, data[0] || { date: '', value: 0 })

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
              <Calendar className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Avg: {formatCurrency(avgDailySales)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Sales</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalSales)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Peak Day</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {peakDay ? formatCurrency(peakDay.value) : '₱0'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Days</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {data.filter(d => d.value > 0).length}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((cell, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-lg transition-all duration-200 relative group",
                  cell.day !== null
                    ? cn(
                        getIntensityColor(cell.value),
                        "hover:scale-110 hover:shadow-lg cursor-pointer",
                        cell.value > 0 && "hover:ring-2 hover:ring-emerald-500"
                      )
                    : "bg-transparent"
                )}
              >
                {cell.day !== null && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn(
                        "text-xs font-semibold",
                        cell.value > maxValue * 0.5 
                          ? "text-white" 
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {cell.day}
                      </span>
                    </div>
                    
                    {/* Tooltip */}
                    {cell.value > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div>{formatCurrency(cell.value)}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400">Less</span>
          <div className="flex gap-1">
            {[0, 20, 40, 60, 80].map((intensity) => (
              <div
                key={intensity}
                className={cn(
                  "w-4 h-4 rounded",
                  getIntensityColor((intensity / 100) * maxValue)
                )}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">More</span>
        </div>
      </CardContent>
    </Card>
  )
}
