"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface WaterfallData {
  label: string
  value: number
  isTotal?: boolean
}

interface WaterfallChartProps {
  data: WaterfallData[]
  title?: string
}

export function WaterfallChart({ data, title = "Profit Breakdown" }: WaterfallChartProps) {
  let runningTotal = 0
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)))
  
  const chartData = data.map((item, index) => {
    const start = runningTotal
    const end = item.isTotal ? item.value : runningTotal + item.value
    runningTotal = end
    
    return {
      ...item,
      start,
      end,
      height: Math.abs(item.isTotal ? item.value : item.value),
      isPositive: item.value >= 0,
    }
  })

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <DollarSign className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const barHeight = (item.height / maxValue) * 100
            const isTotal = item.isTotal
            
            return (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  {/* Label */}
                  <div className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </div>
                  
                  {/* Bar */}
                  <div className="flex-1 relative h-12 flex items-center">
                    <div
                      className={`
                        h-full rounded-lg transition-all duration-500 ease-out
                        ${isTotal 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' 
                          : item.isPositive 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }
                      `}
                      style={{ 
                        width: `${barHeight}%`,
                        minWidth: '60px'
                      }}
                    >
                      <div className="h-full flex items-center justify-end px-3">
                        <span className="text-white font-semibold text-sm">
                          {formatCurrency(Math.abs(item.value))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-8">
                    {!isTotal && (
                      item.isPositive ? (
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )
                    )}
                  </div>
                </div>
                
                {/* Connector line */}
                {index < chartData.length - 1 && !isTotal && (
                  <div className="ml-32 mt-1 mb-1 border-l-2 border-dashed border-slate-300 dark:border-slate-700 h-2" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
