"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, TrendingDown, Percent, BarChart3, ChevronLeft, ChevronRight, Download, Calendar, ShoppingCart, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

import type { SalesReport } from "@/lib/types"
import { formatCurrency, formatNumber } from "@/lib/utils"

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')
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
        setReport(reportData)

      } catch (error) {
        console.error("Error fetching data:", error)
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

  function exportToCSV() {
    const data = view === 'daily' ? dailySales : monthlySales
    const headers = view === 'daily' ? ['Date', 'Revenue'] : ['Month', 'Revenue']
    const rows = data.map(item => [
      view === 'daily' ? item.date : item.month,
      item.revenue
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-analytics-${view}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
  const rawMonthlySales = report?.monthlySales ?? []
  
  // Ensure all 12 months are displayed (Jan-Dec) with 0 revenue if no data
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0')
    const monthKey = `2026-${monthNum}` // Current year
    const existingData = rawMonthlySales.find(m => m.month === monthKey)
    return existingData || { month: monthKey, revenue: 0 }
  })

  // Calculate additional metrics
  const avgDailyRevenue = dailySales.length > 0 
    ? dailySales.reduce((sum, d) => sum + d.revenue, 0) / dailySales.length 
    : 0
  
  const highestSaleDay = dailySales.length > 0
    ? dailySales.reduce((max, d) => d.revenue > max.revenue ? d : max, dailySales[0])
    : null

  const totalTransactions = dailySales.reduce((sum, d) => sum + (d.revenue > 0 ? 1 : 0), 0)

  const profitMarginTrend = report?.profitMargin && report.profitMargin > 0 ? 'up' : 'down'

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Sales Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Comprehensive sales performance analysis and business insights
        </p>
      </div>

      {/* Sales Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(report?.totalRevenue || 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                Cost
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(report?.totalCost || 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Cost</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                {profitMarginTrend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                Profit
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(report?.totalProfit || 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Net Profit</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                Margin
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {(report?.profitMargin || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Profit Margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Avg Daily Revenue</div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(avgDailyRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-[5px] bg-emerald-100 dark:bg-emerald-900/30">
                <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Transactions</div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {formatNumber(totalTransactions)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Highest Sale Day</div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {highestSaleDay ? formatCurrency(highestSaleDay.revenue) : '₱0.00'}
            </div>
            {highestSaleDay && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(highestSaleDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter and Controls */}
      <Card className="mb-4 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">View Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={view === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('daily')}
                    className="h-9 flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Daily
                  </Button>
                  <Button
                    variant={view === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('monthly')}
                    className="h-9 flex-1"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Monthly
                  </Button>
                </div>
              </div>

              {view === 'monthly' && (
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Chart Type</Label>
                  <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}>
                    <SelectTrigger className="h-9 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {view === 'daily' && (
                <div className="flex items-center gap-2 flex-1">
                  <Button variant="outline" size="sm" onClick={prevMonth} className="h-9 flex-shrink-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white text-center flex-1">
                    {monthYear}
                  </span>
                  <Button variant="outline" size="sm" onClick={nextMonth} className="h-9 flex-shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="gap-2 h-9 w-full sm:w-auto"
                disabled={dailySales.length === 0 && monthlySales.length === 0}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {view === 'daily' ? (
        dailySales.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-250">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-[5px] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                  <Calendar className="h-5 w-5" />
                </div>
                Daily Sales Calendar - {monthYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[640px] p-4">
                  <div className="grid grid-cols-7 gap-0.5">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays(currentMonth, dailySales).map((cell, index) => (
                  <div key={index} className="relative h-24">
                    {cell.day !== null ? (
                      <div
                        className={cn(
                          "h-full p-2 border border-slate-200 dark:border-slate-700 rounded-[5px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 flex flex-col justify-between shadow-sm",
                          cell.revenue > 0 && "border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20"
                        )}
                      >
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{cell.day}</div>
                        <div className="text-center">
                          {cell.revenue > 0 ? (
                            <>
                              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(cell.revenue)}
                              </div>
                              <Badge className="mt-1 h-4 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                                Sale
                              </Badge>
                            </>
                          ) : (
                            <div className="text-xs text-slate-400 dark:text-slate-600">No sales</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full p-2 opacity-30 rounded-[5px] bg-slate-100 dark:bg-slate-800/20" />
                    )}
                  </div>
                ))}
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Sales Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">No sales data available for {monthYear}.</p>
            </CardContent>
          </Card>
        )
      ) : (
        monthlySales.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-250">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-[5px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Monthly Sales Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-[350px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  {chartType === 'bar' ? (
                    <BarChart data={monthlySales} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        minTickGap={32}
                        tickFormatter={(month) => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                        className="text-xs"
                      />
                      <YAxis 
                        tickLine={false}
                        tickMargin={10}
                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                        className="text-xs"
                        width={45}
                      />
                      <ChartTooltipContent
                        formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#colorRevenue)" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={monthlySales} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      minTickGap={32}
                      tickFormatter={(month) => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      className="text-xs"
                    />
                    <YAxis 
                      tickLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                      width={45}
                    />
                    <ChartTooltipContent
                      formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    />
                    <Line 
                      type="monotone"
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={monthlySales} margin={{ left: 0, right: 30, top: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      minTickGap={32}
                      tickFormatter={(month) => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      className="text-xs"
                    />
                    <YAxis 
                      tickLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                      width={45}
                    />
                    <ChartTooltipContent
                      formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    />
                    <defs>
                      <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone"
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#colorArea)"
                    />
                  </AreaChart>
                )}
              </ChartContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Monthly Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">No monthly sales data available.</p>
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
