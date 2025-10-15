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

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'daily' | 'monthly'>('daily')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    async function fetchData() {
      try {
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

        const reportData = await reportRes.json()

        console.log("[Analytics Debug] Report Data:", reportData)

        setReport(reportData)

      } catch (error) {
        console.error("[Analytics] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [view, currentMonth])

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setLoading(true)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setLoading(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
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
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen dark:from-slate-900 dark:to-slate-800">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">
          {view === 'daily' ? 'Daily Sales Analytics' : 'Monthly Sales Analytics'}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Comprehensive sales performance analysis and insights</p>
      </div>

      {/* Sales Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Stocks Value</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₱{(report?.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
            <TrendingDown className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₱{(report?.totalCost || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Total Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₱{(report?.totalProfit || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(report?.profitMargin || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Month Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                variant={view === 'daily' ? 'default' : 'outline'}
                onClick={() => setView('daily')}
                className="flex-1 sm:flex-none"
              >
                Daily Sales
              </Button>
              <Button
                variant={view === 'monthly' ? 'default' : 'outline'}
                onClick={() => setView('monthly')}
                className="flex-1 sm:flex-none"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Product Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-0.5 p-2">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-1 text-xs md:text-sm font-medium text-muted-foreground border-b border-border">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays(currentMonth, dailySales).map((cell, index) => (
                  <div key={index} className="relative h-16 md:h-20">
                    {cell.day !== null ? (
                      <div
                        className={cn(
                          "h-full p-0.5 md:p-1 border border-border rounded bg-background flex flex-col justify-center items-center",
                          cell.revenue > 0 && "border-r-4 border-orange-500"
                        )}
                      >
                        <div className="text-xs md:text-sm text-foreground text-center">{cell.day}</div>
                        <div className={`text-xs md:text-sm text-center ${cell.revenue > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {cell.revenue > 0 ? `₱${cell.revenue.toFixed(2)}` : '₱0.00'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full p-0.5 md:p-1 opacity-50" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No sales data available for {monthYear}.</p>
            </CardContent>
          </Card>
        )
      ) : (
        monthlySales.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Sales Revenue</CardTitle>
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
                    formatter={(value) => [`₱${(value as number).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No monthly sales data available.</p>
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
