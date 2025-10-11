"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DollarSign, Users, Target } from "lucide-react"

import type { SalesReport } from "@/lib/types"

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30')

  useEffect(() => {
    async function fetchData() {
      try {
        const days = parseInt(timeRange)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const startDateStr = startDate.toISOString().split('T')[0]

        const url = new URL('/api/reports', window.location.origin)
        url.searchParams.append('startDate', startDateStr)
        url.searchParams.append('daily', 'true')

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
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  const totalRevenue = report?.totalRevenue ?? 0
  const itemsSold = report?.itemsSold ?? 0
  const profitMargin = report?.profitMargin ?? 0
  const avgPurchaseValue = itemsSold > 0 ? totalRevenue / itemsSold : 0
  const stats = [
    { title: "Current Purchases", value: itemsSold.toLocaleString(), icon: Users, color: "text-blue-600" },
    { title: "Current Purchase Value", value: `₱${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Average Purchase Value", value: `₱${avgPurchaseValue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Win Rate", value: `${profitMargin.toFixed(1)}%`, icon: Target, color: "text-orange-600" },
  ]

  const chartConfig = {
    revenue: {
      label: "Daily Revenue",
      color: "hsl(var(--primary))",
    },
  }

  const dailySales = report?.dailySales ?? []

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sales and performance analytics</p>
      </div>

      {/* Top Cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex justify-center">
        <div className="flex space-x-2">
          <Button
            variant={timeRange === '30' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30')}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeRange === '90' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90')}
          >
            Last 90 Days
          </Button>
        </div>
      </div>

      {dailySales.length > 0 ? (
        <>
          {/* Daily Sales Bar Chart */}
          <Card className="mb-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daily Sales Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-0">
              <ChartContainer config={chartConfig}>
                <BarChart data={dailySales} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatDate}
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

          {/* Daily Sales Trend Line Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-0">
              <ChartContainer config={chartConfig}>
                <LineChart data={dailySales} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <ChartTooltipContent
                    formatter={(value) => [`₱${(value as number).toFixed(2)}`, 'Revenue']}
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No sales data available for the selected period.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
