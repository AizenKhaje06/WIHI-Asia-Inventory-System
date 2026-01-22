"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { SalesReport } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = endDate.toISOString().split('T')[0]

        const url = new URL('/api/reports', window.location.origin)
        url.searchParams.append('startDate', startDateStr)
        url.searchParams.append('endDate', endDateStr)
        url.searchParams.append('view', view)

        const reportRes = await fetch(url)

        if (!reportRes.ok) {
          throw new Error(`Failed to fetch data: ${reportRes.status} ${reportRes.statusText}`)
        }

        const reportData = await reportRes.json()

        console.log("[Analytics Debug] Report Data:", reportData)

        setReport(reportData)

      } catch (error) {
        console.error("[Analytics] Error fetching data:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
        setReport(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [view, currentMonth])

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setLoading(true)
    setError(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setLoading(true)
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading analytics</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    )
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dailySales = report?.dailySales ?? []
  const monthlySales = report?.monthlySales ?? []

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  }

  const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1) // Avoid division by zero

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Transactions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Comprehensive sales performance analysis and insights
        </p>
      </div>

      {/* Sales Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-50">Total Stocks Value</CardTitle>
            <DollarSign className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(report?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-50">Total Revenue</CardTitle>
            <TrendingDown className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(report?.totalCost || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-50">Total Cost</CardTitle>
            <TrendingUp className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(report?.totalProfit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-50">Profit Margin</CardTitle>
            <Percent className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(report?.profitMargin || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Month Navigation */}
      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant={view === 'daily' ? 'default' : 'outline'}
                onClick={() => setView('daily')}
              >
                Daily Sales
              </Button>
              <Button
                variant={view === 'monthly' ? 'default' : 'outline'}
                onClick={() => setView('monthly')}
              >
                Monthly Sales
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground">{monthYear}</span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === 'daily' ? (
        dailySales.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Product Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-0.5 p-2">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-1 text-sm font-medium text-muted-foreground border-b border-border">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays(currentMonth, dailySales).map((cell, index) => (
                  <div key={index} className="relative h-24">
                    {cell.day !== null ? (
                      <div
                        className={cn(
                          "h-full p-2 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors flex flex-col justify-center items-center shadow-sm",
                          cell.revenue > 0 && "border-r-4 border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20"
                        )}
                      >
                        <div className="text-base font-semibold text-foreground text-center mb-1">{cell.day}</div>
                        <div className={`text-sm text-center font-medium ${cell.revenue > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {cell.revenue > 0 ? formatCurrency(cell.revenue) : '₱0.00'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full p-2 opacity-30 rounded-lg bg-muted/20" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No sales data available for {monthYear}.</p>
            </CardContent>
          </Card>
        )
      ) : (
        monthlySales.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Monthly Sales Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-0">
              <ChartContainer config={chartConfig}>
                <BarChart data={monthlySales} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(month) => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  />
                  <YAxis />
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No monthly sales data available.</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

function generateCalendarDays(month: Date, dailySales: { date: string; revenue: number }[]) {
  const year = month.getFullYear()
  const mon = month.getMonth()
  const firstDay = new Date(year, mon, 1)
  const lastDay = new Date(year, mon + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const salesMap = new Map(dailySales.map(d => [d.date, d.revenue]))

  const calendar = []

  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendar.push({ day: null, revenue: 0 })
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(mon + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const revenue = salesMap.get(dateStr) || 0
    calendar.push({ day: i, revenue })
  }

  // Empty cells after last day to complete weeks
  const totalCells = calendar.length
  const remainingCells = (7 - (totalCells % 7)) % 7
  for (let i = 0; i < remainingCells; i++) {
    calendar.push({ day: null, revenue: 0 })
  }

  return calendar
}
