"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SetupRequiredAlert } from "@/components/setup-required-alert"
import { Package, AlertTriangle, DollarSign, TrendingUp, BarChart3, ShoppingCart, TrendingDown, Users, BarChart2, Activity, ArrowUpRight, ArrowDownRight, Percent, RefreshCw, Download, Plus, FileText, AlertCircle, PackageX, PackageOpen, RotateCcw, FileDown } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { GaugeChart } from "@/components/charts/gauge-chart"
import type { DashboardStats, InventoryItem } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { PremiumDashboardLoading } from "@/components/premium-loading"
import { exportDashboardPDF } from "@/lib/pdf-export"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timePeriod, setTimePeriod] = useState<"ID" | "1W" | "1M">("ID")

  const fetchData = async () => {
    try {
      setRefreshing(true)
      console.log('[Dashboard] Fetching data for period:', timePeriod)
      
      const [statsRes, itemsRes] = await Promise.all([
        fetch(`/api/dashboard?period=${timePeriod}`),
        fetch("/api/items")
      ])

      console.log('[Dashboard] Response status:', {
        stats: statsRes.status,
        items: itemsRes.status
      })

      const statsData = await statsRes.json()
      const itemsData = await itemsRes.json()

      console.log('[Dashboard] Data received:', {
        stats: statsData,
        itemsData: itemsData
      })

      // Ensure itemsData is an array before filtering
      const items = Array.isArray(itemsData) ? itemsData : []

      setStats(statsData)
      setLowStockItems(items.filter((item: InventoryItem) => item.quantity > 0 && item.quantity <= item.reorderLevel))
      setOutOfStockItems(items.filter((item: InventoryItem) => item.quantity === 0))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setStats(null)
      setLowStockItems([])
      setOutOfStockItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timePeriod])

  // Show loading state
  if (loading) {
    return <PremiumDashboardLoading />
  }

  // Calculate additional metrics
  const netProfit = (stats?.totalRevenue || 0) - (stats?.totalCost || 0) - (stats?.returnValue || 0)
  const lowStockCount = lowStockItems.length
  const outOfStockCount = outOfStockItems.length

  // Export dashboard data as CSV
  const exportDashboard = () => {
    const csvRows = [
      ['Dashboard Export', new Date().toLocaleDateString()],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', `₱${formatNumber(stats?.totalRevenue || 0)}`],
      ['Net Profit', `₱${formatNumber(netProfit)}`],
      ['Return Rate', `${(stats?.returnRate || 0).toFixed(1)}%`],
      ['Items Sold Today', stats?.itemsSoldToday || 0],
      ['Profit Margin', `${(stats?.profitMargin || 0).toFixed(1)}%`],
      ['Low Stock Items', lowStockCount],
      ['Out of Stock Items', outOfStockCount],
      [],
      ['Top Products', 'Units Sold', 'Revenue'],
      ...(stats?.topProducts || []).map(p => [p.name, p.sales, `₱${formatNumber(p.revenue)}`])
    ]
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <PremiumDashboardLoading />
  }

  // Format date based on timePeriod
  const formattedSalesData = stats?.salesOverTime?.map(item => {
    let displayDate = item.date
    if (timePeriod === "ID") {
      // Today: show hour only (e.g., "14:00")
      displayDate = item.date.split(' ')[1] || item.date
    } else if (timePeriod === "1W") {
      // Week: format date string
      try {
        const datePart = item.date.split(' ')[0]
        if (datePart && datePart.includes('-')) {
          const dateObj = new Date(datePart)
          if (!isNaN(dateObj.getTime())) {
            displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        }
      } catch (e) {
        console.error('Date parsing error:', e, item.date)
        displayDate = item.date // Fallback to original
      }
    } else if (timePeriod === "1M") {
      // Month: date is already formatted as "Feb 1", "Feb 2", etc. from API
      displayDate = item.date
    }
    return { ...item, date: displayDate }
  }) || []

  console.log('[Dashboard] Formatted sales data:', formattedSalesData)
  console.log('[Dashboard] Time period:', timePeriod)

  const stocksCountData = stats?.stocksCountByCategory?.map((cat) => ({
    name: cat.name,
    count: cat.count,
  })) || []

  const stocksCountByStorageRoomData = stats?.stocksCountByStorageRoom?.map((room) => ({
    name: room.name,
    count: room.count,
  })) || []

  return (
    <div className="space-y-6 pt-6">
      {/* Page Header - Vertically aligned with sidebar brand */}
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      {/* Setup Required Alert */}
      {!stats && !loading && (
        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <SetupRequiredAlert />
        </div>
      )}

      {/* Enhanced Metric Cards - 6 KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        {/* Total Revenue */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={stats?.totalRevenue || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Revenue</div>
            {stats?.revenueToday !== undefined && stats.revenueToday > 0 && (
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ₱{formatNumber(stats.revenueToday)} today
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Profit (after returns) */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={netProfit} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Net Profit</div>
            {stats?.returnValue !== undefined && stats.returnValue > 0 && (
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  ₱{formatNumber(stats.returnValue)} returns
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sold - REPLACED Return Rate */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              <AnimatedNumber value={stats?.totalSales || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Sold</div>
            {stats?.totalSales !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  All-time quantity sold
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Sold Today - NEW */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-orange-100 dark:bg-orange-900/30">
                <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              <AnimatedNumber value={stats?.itemsSoldToday || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Items Sold Today</div>
            {stats?.itemsSoldToday !== undefined && stats.itemsSoldToday > 0 && (
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {stats.recentSales} transactions
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              <AnimatedNumber value={stats?.profitMargin || 0} decimals={1} duration={1500} />%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Profit Margin</div>
            {stats?.profitMargin !== undefined && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-xs font-medium",
                  (stats.profitMargin || 0) >= 30 ? "text-green-600 dark:text-green-400" :
                  (stats.profitMargin || 0) >= 15 ? "text-amber-600 dark:text-amber-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {(stats.profitMargin || 0) >= 30 ? "Excellent" :
                   (stats.profitMargin || 0) >= 15 ? "Good" : "Needs improvement"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Value - 6th KPI */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={stats?.totalValue || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Inventory Value</div>
            {stats?.totalItems !== undefined && (
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {stats.totalItems} items in stock
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row - 4 Mini Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-125">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedNumber value={stats?.totalItems || 0} duration={1000} />
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">Total Products</div>
              </div>
              <Package className="h-10 w-10 text-blue-400 dark:text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  <AnimatedNumber value={lowStockCount} duration={1000} />
                </div>
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-1">Low Stock</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-400 dark:text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  <AnimatedNumber value={outOfStockCount} duration={1000} />
                </div>
                <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-1">Out of Stock</div>
              </div>
              <PackageX className="h-10 w-10 text-red-400 dark:text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  <AnimatedNumber value={stats?.returnRate || 0} decimals={1} duration={1000} />%
                </div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Return Rate</div>
                {stats?.damagedReturnRate !== undefined && stats?.supplierReturnRate !== undefined && (
                  <div className="space-y-1">
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      • Damaged: {stats.damagedReturnRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      • Supplier: {stats.supplierReturnRate.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              <RotateCcw className="h-10 w-10 text-orange-400 dark:text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Critical Alerts - Phase 1 Redesign */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-auto py-3" asChild>
                <Link href="/dashboard/inventory/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3" asChild>
                <Link href="/dashboard/pos">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  New Sale
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3" asChild>
                <Link href="/dashboard/inventory/low-stock">
                  <Package className="h-4 w-4 mr-2" />
                  Restock
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-auto py-3" asChild>
                <Link href="/dashboard/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts - Redesigned Compact */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Inventory Alerts
              {(outOfStockCount + lowStockCount) > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {outOfStockCount + lowStockCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(outOfStockCount > 0 || lowStockCount > 0) ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Out of Stock Card */}
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {outOfStockCount}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Out of Stock
                        </div>
                      </div>
                      <PackageX className="h-8 w-8 text-red-400 dark:text-red-500" />
                    </div>
                    {outOfStockCount > 0 && (
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="text-red-600 dark:text-red-400 h-auto p-0 text-xs font-medium" 
                        asChild
                      >
                        <Link href="/dashboard/inventory/out-of-stock">
                          View Items →
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Low Stock Card */}
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {lowStockCount}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Low Stock
                        </div>
                      </div>
                      <PackageOpen className="h-8 w-8 text-amber-400 dark:text-amber-500" />
                    </div>
                    {lowStockCount > 0 && (
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="text-amber-600 dark:text-amber-400 h-auto p-0 text-xs font-medium" 
                        asChild
                      >
                        <Link href="/dashboard/inventory/low-stock">
                          Restock Now →
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">All inventory levels are healthy</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">No immediate action required</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart - Modern Design */}
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Revenue</CardTitle>
            </div>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
              <TabsList className="bg-slate-100 dark:bg-slate-800">
                <TabsTrigger value="ID" className="text-xs">Day</TabsTrigger>
                <TabsTrigger value="1W" className="text-xs">Week</TabsTrigger>
                <TabsTrigger value="1M" className="text-xs">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Comparison Metrics */}
          <div className="flex gap-8 mt-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {timePeriod === 'ID' ? 'Today' : timePeriod === '1W' ? 'This week' : 'This month'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₱{formatNumber(
                    formattedSalesData.reduce((sum, item) => sum + item.sales, 0)
                  )}
                </span>
                {formattedSalesData.length > 0 && (() => {
                  const currentTotal = formattedSalesData.reduce((sum, item) => sum + item.sales, 0)
                  // Get previous period total based on tab
                  let previousTotal = 0
                  if (timePeriod === 'ID') {
                    // Day tab: yesterday (full calendar day from API)
                    previousTotal = stats?.yesterdaySales || 0
                  } else if (timePeriod === '1W') {
                    // Week tab: last week total from API
                    previousTotal = stats?.lastWeekSales || 0
                  } else if (timePeriod === '1M') {
                    // Month tab: last month total from API
                    previousTotal = stats?.lastMonthSales || 0
                  }
                  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0
                  return change !== 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                      <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {change > 0 ? `+${change.toFixed(0)}` : change.toFixed(0)}%
                      </span>
                    </div>
                  )
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {timePeriod === 'ID' ? 'Yesterday' : timePeriod === '1W' ? 'Last week' : 'Last month'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                  ₱{formatNumber(
                    (() => {
                      if (timePeriod === 'ID') {
                        // Day tab: yesterday (full calendar day from API)
                        return stats?.yesterdaySales || 0
                      } else if (timePeriod === '1W') {
                        // Week tab: last week total from API
                        return stats?.lastWeekSales || 0
                      } else if (timePeriod === '1M') {
                        // Month tab: last month total from API
                        return stats?.lastMonthSales || 0
                      }
                      return 0
                    })()
                  )}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Previous period sales
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320} className="min-h-[250px]">
            <AreaChart data={formattedSalesData} margin={{ top: 10, bottom: 30, left: 10, right: 10 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="date" 
                className="fill-slate-400 dark:fill-slate-500" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={timePeriod === '1M' ? 5 : 0}
                dy={10}
              />
              <YAxis 
                className="fill-slate-400 dark:fill-slate-500" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${formatNumber(value)}`}
                width={50}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{payload[0].payload.date}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₱{formatNumber(Number(payload[0].value))}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              {/* Current Period Line (Solid Blue with Area) */}
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#6366F1" 
                strokeWidth={3} 
                fill="url(#salesGradient)" 
                dot={false}
                activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              {/* Purchase Costs Line (Dashed Orange) */}
              <Area 
                type="monotone" 
                dataKey="purchases" 
                stroke="#F97316" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                fill="transparent" 
                dot={false}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Charts - 3 Horizontal Bar Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
        {/* Top Products Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={stats.topProducts} 
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="topProductsGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                  <XAxis 
                    type="number"
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    width={100}
                  />
                  <Tooltip 
                    content={<ChartTooltip formatter={(value, name) => {
                      if (name === 'revenue') return [`₱${formatNumber(Number(value))}`, 'Revenue']
                      return [value.toString(), 'Units Sold']
                    }} />}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#topProductsGradient)" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20">
                <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No sales data yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Start selling to see top products</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return To Seller Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <RotateCcw className="h-5 w-5 text-red-600" />
              Return To Seller
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.supplierReturns && stats.supplierReturns.length > 0 ? (
              <div className="space-y-6">
                {/* Overall Return Rate Gauge - Bigger */}
                <div className="flex justify-center py-6">
                  <GaugeChart
                    value={stats.supplierReturns.reduce((sum, item) => sum + item.quantity, 0)}
                    max={stats.totalSales || 100}
                    label="Return Rate"
                    size={240}
                  />
                </div>

                {/* Top Returned Products - Clean List */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Top Returned Products</h4>
                  <div className="space-y-3">
                    {stats.supplierReturns.slice(0, 3).map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-[5px] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {item.itemName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.quantity} {item.quantity === 1 ? 'item' : 'items'} returned
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">
                            ₱{formatNumber(item.value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {stats.supplierReturns.length > 3 && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        +{stats.supplierReturns.length - 3} more products
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <RotateCcw className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No supplier returns yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Items returned to suppliers will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Categories Chart - NEW */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart2 className="h-5 w-5 text-purple-600" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topCategories && stats.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={stats.topCategories} 
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="categoryGradient2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#9333EA" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                  <XAxis 
                    type="number"
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    width={100}
                  />
                  <Tooltip 
                    content={<ChartTooltip formatter={(value) => [value.toString(), 'Units Sold']} />}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="url(#categoryGradient2)" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20">
                <BarChart2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No category data yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Sales by category will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts - 2 Vertical Bar Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-350">
        {/* Stock by Category Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-green-600" />
              Stock Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stocksCountData} margin={{ top: 10, bottom: 60, left: 0, right: 10 }}>
                <defs>
                  <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  width={50}
                />
                <Tooltip 
                  content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#categoryGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock by Storage Room Chart - NEW */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Package className="h-5 w-5 text-blue-600" />
              Stock by Storage Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stocksCountByStorageRoomData} margin={{ top: 10, bottom: 20, left: 0, right: 10 }}>
                <defs>
                  <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  width={50}
                />
                <Tooltip 
                  content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#storageGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - 2 Lists */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
        {/* Recent Sales */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-[5px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-slate-900 dark:text-white">{tx.itemName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{tx.quantity} units</div>
                    </div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ₱{formatNumber(tx.totalRevenue)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">No recent sales</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Restocks - NEW */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Recent Restocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentRestocks && stats.recentRestocks.length > 0 ? (
                stats.recentRestocks.map((restock, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-[5px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-slate-900 dark:text-white">{restock.itemName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{restock.quantity} units</div>
                    </div>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ₱{formatNumber(restock.totalCost)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">No recent restocks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights & Inventory Health - NEW */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-450">
        {/* Business Insights */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.insights && stats.insights.length > 0 ? (
                stats.insights.map((insight, index) => (
                  <Alert 
                    key={index} 
                    className={cn(
                      "border-l-4",
                      insight.type === 'success' && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      insight.type === 'warning' && "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
                      insight.type === 'error' && "border-red-500 bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <AlertDescription className="text-sm font-medium">
                      {insight.message}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">No insights available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Health Score - NEW */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (stats?.inventoryHealthScore || 0) / 100)}`}
                    className={cn(
                      "transition-all duration-1000",
                      (stats?.inventoryHealthScore || 0) >= 80 ? "text-green-500" :
                      (stats?.inventoryHealthScore || 0) >= 60 ? "text-amber-500" :
                      "text-red-500"
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats?.inventoryHealthScore || 0}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">/ 100</div>
                  </div>
                </div>
              </div>
              <div className={cn(
                "text-sm font-semibold",
                (stats?.inventoryHealthScore || 0) >= 80 ? "text-green-600 dark:text-green-400" :
                (stats?.inventoryHealthScore || 0) >= 60 ? "text-amber-600 dark:text-amber-400" :
                "text-red-600 dark:text-red-400"
              )}>
                {(stats?.inventoryHealthScore || 0) >= 80 ? "Excellent Health" :
                 (stats?.inventoryHealthScore || 0) >= 60 ? "Good Health" :
                 (stats?.inventoryHealthScore || 0) >= 40 ? "Fair Health" : "Needs Attention"}
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Stock Levels:</span>
                  <span className="font-medium">{Math.round(((stats?.totalItems || 0) - (stats?.outOfStockCount || 0)) / (stats?.totalItems || 1) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Return Rate:</span>
                  <span className="font-medium">{(stats?.returnRate || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Low Stock:</span>
                  <span className="font-medium">{lowStockCount} items</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
