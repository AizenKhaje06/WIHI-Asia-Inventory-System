"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, AlertTriangle, DollarSign, TrendingUp, BarChart2, ShoppingCart, Activity, ArrowUpRight, ArrowDownRight, Percent, Plus, FileText, AlertCircle, PackageX, PackageOpen, RotateCcw, Download, Calendar } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { GaugeChart } from "@/components/charts/gauge-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import type { DashboardStats, InventoryItem } from "@/lib/types"
import type { TimePeriod } from "@/components/dashboard/revenue-chart"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { PremiumDashboardLoading } from "@/components/premium-loading"
import { BrandLoader } from "@/components/ui/brand-loader"
import { apiGet } from "@/lib/api-client"
import { formatChartData, calculatePeriodComparison } from "@/lib/dashboard-utils"
import { getCurrentUser } from "@/lib/auth"
import { getCurrentUserRole } from "@/lib/role-utils"
import { EnterpriseDateRangePicker } from "@/components/ui/enterprise-date-range-picker"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("ID")
  
  // Default to current month (first day to last day)
  const getDefaultDateRange = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }
  
  const { firstDay, lastDay } = getDefaultDateRange()
  const [startDate, setStartDate] = useState<Date | null>(firstDay)
  const [endDate, setEndDate] = useState<Date | null>(lastDay)
  const currentUser = getCurrentUser()

  const fetchData = async () => {
    try {
      setRefreshing(true)
      console.log('[Dashboard] Fetching data for period:', timePeriod)
      
      // Build API URL
      // - Tabs (Day/Week/Month) control chart data with their own date ranges
      // - Date picker controls KPI cards and other metrics
      let apiUrl = `/api/dashboard?period=${timePeriod}`
      
      // Add date filter for KPI cards (if set)
      if (startDate) {
        apiUrl += `&startDate=${startDate.toISOString()}`
      }
      if (endDate) {
        apiUrl += `&endDate=${endDate.toISOString()}`
      }
      
      const [stats, items] = await Promise.all([
        apiGet<DashboardStats>(apiUrl),
        apiGet<InventoryItem[]>("/api/items")
      ])

      console.log('[Dashboard] Data received:', {
        stats: stats,
        items: items
      })

      setStats(stats)
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
  }, [timePeriod, startDate, endDate]) // Refetch when tab OR date filter changes

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate additional metrics
  // Note: totalProfit already excludes returns (calculated from filtered orders)
  const netProfit = stats?.totalProfit || 0
  const lowStockCount = lowStockItems.length
  const outOfStockCount = outOfStockItems.length

  const stocksCountData = stats?.stocksCountByCategory?.map((cat) => ({
    name: cat.name,
    count: cat.count,
  })) || []

  const stocksCountByStoreData = stats?.stocksCountByStore?.map((store) => ({
    name: store.name,
    count: store.count,
  })) || []

  const storePerformanceData = stats?.storePerformance?.map((store) => ({
    name: store.name,
    count: store.count,
  })) || []

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header - Professional Shopify Style */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Dashboard Overview</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        
        {/* Actions - Date Picker Only */}
        <div className="flex items-center gap-3">
          {/* Date Range Picker - No wrapper, direct component */}
          <EnterpriseDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start)
              setEndDate(end)
            }}
          />
        </div>
      </div>

      {/* Redesigned KPI Cards - 2 Rows Only */}
      
      {/* Row 1: Financial Metrics (4 cards) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sold */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <ShoppingCart className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Sold</p>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">
                <AnimatedNumber value={stats?.totalSales || 0} duration={1500} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              All-time quantity
            </span>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-green-600 shadow-lg shadow-green-500/30">
              <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Total Revenue</p>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 tabular-nums">
                ₱<AnimatedNumber value={stats?.totalRevenue || 0} duration={1500} />
              </div>
            </div>
          </div>
          {startDate || endDate ? (
            stats?.totalRevenue && stats.totalRevenue > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  Filtered period
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                No sales in period
              </div>
            )
          ) : (
            stats?.revenueToday !== undefined && stats.revenueToday > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ₱{formatNumber(stats.revenueToday)} today
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                No sales today yet
              </div>
            )
          )}
        </Card>

        {/* Net Profit */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/30">
              <DollarSign className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Net Profit</p>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">
                ₱<AnimatedNumber value={netProfit} duration={1500} />
              </div>
            </div>
          </div>
          {startDate || endDate ? (
            stats?.returnValue !== undefined && stats.returnValue > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  ₱{formatNumber(stats.returnValue)} returns
                </span>
              </div>
            ) : (
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                No returns
              </div>
            )
          ) : (
            stats?.returnValue !== undefined && stats.returnValue > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  ₱{formatNumber(stats.returnValue)} returns
                </span>
              </div>
            ) : (
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                No returns
              </div>
            )
          )}
        </Card>

        {/* Profit Margin */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-600 shadow-lg shadow-amber-500/30">
              <Percent className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Profit Margin</p>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 tabular-nums">
                <AnimatedNumber value={stats?.profitMargin || 0} decimals={1} duration={1500} />%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(stats?.profitMargin || 0) >= 30 ? (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">🏆 Excellent!</span>
            ) : (stats?.profitMargin || 0) >= 15 ? (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">✓ Good</span>
            ) : (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">⚠ Improve</span>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Order Status Metrics (4 cards) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cancelled (Packing Queue) */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-rose-600 shadow-lg shadow-rose-500/30">
              <PackageX className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Cancelled (Packing)</p>
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 tabular-nums">
                <AnimatedNumber value={stats?.cancelledPackingQueue || 0} duration={1500} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Before packing
            </span>
          </div>
        </Card>

        {/* Cancelled (Track Orders) */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-pink-600 shadow-lg shadow-pink-500/30">
              <PackageX className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">Cancelled (Tracked)</p>
              <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 tabular-nums">
                <AnimatedNumber value={stats?.cancelledTrackOrders || 0} duration={1500} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold">
              After packing
            </span>
          </div>
        </Card>

        {/* Total Delivered */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Delivered</p>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 tabular-nums">
                <AnimatedNumber value={stats?.totalDelivered || 0} duration={1500} />
              </div>
            </div>
          </div>
          {stats?.deliveredPercentage !== undefined ? (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <AnimatedNumber value={stats.deliveredPercentage} decimals={1} duration={1500} />% of total orders
            </div>
          ) : (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              No deliveries yet
            </div>
          )}
        </Card>

        {/* Total Returns */}
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-orange-600 shadow-lg shadow-orange-500/30">
              <RotateCcw className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Total Returns</p>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 tabular-nums">
                <AnimatedNumber value={stats?.totalReturns || 0} duration={1500} />
              </div>
            </div>
          </div>
          {stats?.returnRate !== undefined && stats.returnRate > 0 ? (
            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
              <AnimatedNumber value={stats.returnRate} decimals={1} duration={1500} />% of delivered
            </div>
          ) : (
            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
              No returns yet
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className={cn(
        "grid gap-5",
        currentUser?.role === 'admin' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Quick Actions - Admin Only */}
        {currentUser?.role === 'admin' && (
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-auto py-3 text-xs justify-start" asChild>
                  <Link href="/dashboard/inventory/create">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add Product
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 text-xs justify-start" asChild>
                  <Link href="/dashboard/pos">
                    <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                    New Sale
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 text-xs justify-start" asChild>
                  <Link href="/dashboard/inventory/low-stock">
                    <Package className="h-3.5 w-3.5 mr-2" />
                    Restock
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 text-xs justify-start" asChild>
                  <Link href="/dashboard/analytics">
                    <FileText className="h-3.5 w-3.5 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Alerts - Redesigned Compact */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Inventory Alerts
              {(outOfStockCount + lowStockCount) > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs px-2 py-0.5">
                  {outOfStockCount + lowStockCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(outOfStockCount > 0 || lowStockCount > 0) ? (
              <div className="grid grid-cols-2 gap-2">
                {/* Out of Stock Card */}
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">
                          {outOfStockCount}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Out of Stock
                        </div>
                      </div>
                      <PackageX className="h-6 w-6 text-red-400 dark:text-red-500" />
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
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {lowStockCount}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Low Stock
                        </div>
                      </div>
                      <PackageOpen className="h-6 w-6 text-amber-400 dark:text-amber-500" />
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
              <div className="text-center py-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mb-1.5">
                  <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">All inventory levels are healthy</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">No immediate action required</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Revenue Chart - Enterprise Level */}
      <RevenueChart
        data={formatChartData(stats?.salesOverTime, timePeriod)}
        timePeriod={timePeriod}
        onPeriodChange={setTimePeriod}
        comparison={calculatePeriodComparison(stats, timePeriod)}
        loading={refreshing}
      />

      {/* Performance Analytics */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
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
                  <CartesianGrid strokeDasharray="0" className="stroke-gray-200 dark:stroke-gray-800" opacity={0.5} horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    className="fill-gray-500 dark:fill-gray-500" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    content={<ChartTooltip formatter={(value, name) => {
                      if (name === 'sales') return [value.toString(), 'Units Sold']
                      return [value.toString(), 'Units Sold']
                    }} />}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#10B981" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
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

        {/* Top Categories Chart */}
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
                  <CartesianGrid strokeDasharray="0" className="stroke-gray-200 dark:stroke-gray-800" opacity={0.5} horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    className="fill-gray-500 dark:fill-gray-500" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    content={<ChartTooltip formatter={(value) => [value.toString(), 'Units Sold']} />}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#A855F7" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
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

        {/* Return Count by Sales Channel */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <RotateCcw className="h-5 w-5 text-red-600" />
              Return Count by Sales Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.cancelledOrdersByChannel && Object.keys(stats.cancelledOrdersByChannel).length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={Object.entries(stats.cancelledOrdersByChannel).map(([name, data]) => ({ 
                    name, 
                    count: typeof data === 'object' ? data.count : data 
                  }))} 
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="0" className="stroke-gray-200 dark:stroke-gray-800" opacity={0.5} horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    className="fill-gray-500 dark:fill-gray-500" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    content={<ChartTooltip formatter={(value) => [value.toString(), 'Returns']} />}
                    cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#EF4444" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20">
                <RotateCcw className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No returns yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Returned orders by channel will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Distribution */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        {/* Department Performance Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Package className="h-5 w-5 text-blue-600" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stocksCountByStoreData} margin={{ top: 10, bottom: 20, left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="0" className="stroke-gray-200 dark:stroke-gray-800" opacity={0.5} horizontal={true} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-500 dark:fill-gray-500" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={<ChartTooltip formatter={(value) => [`₱${formatNumber(value as number)}`, 'Revenue']} />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Store Performance Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-green-600" />
              Store Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={storePerformanceData} margin={{ top: 10, bottom: 20, left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="0" className="stroke-gray-200 dark:stroke-gray-800" opacity={0.5} horizontal={true} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-500 dark:fill-gray-500" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={<ChartTooltip formatter={(value) => [`₱${formatNumber(value as number)}`, 'Revenue']} />}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
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
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.quantity} units</span>
                        {tx.staffName && (
                          <>
                            <span>•</span>
                            <span className="truncate">by {tx.staffName}</span>
                          </>
                        )}
                      </div>
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

      {/* Insights & Health */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
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

        {/* Inventory Health Score - Meter Style */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Health Score Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats?.inventoryHealthScore || 0}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      (stats?.inventoryHealthScore || 0) >= 80 ? "bg-gradient-to-r from-green-500 to-green-600" :
                      (stats?.inventoryHealthScore || 0) >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                      "bg-gradient-to-r from-red-500 to-red-600"
                    )}
                    style={{ width: `${stats?.inventoryHealthScore || 0}%` }}
                  />
                </div>

                {/* Status Label */}
                <div className="flex items-center justify-center">
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    (stats?.inventoryHealthScore || 0) >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    (stats?.inventoryHealthScore || 0) >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {(stats?.inventoryHealthScore || 0) >= 80 ? "Excellent Health" :
                     (stats?.inventoryHealthScore || 0) >= 60 ? "Good Health" :
                     (stats?.inventoryHealthScore || 0) >= 40 ? "Fair Health" : "Needs Attention"}
                  </span>
                </div>
              </div>

              {/* Metrics Grid - Mobile Optimized */}
              <div className="space-y-2.5 pt-2">
                {/* Stock Levels */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                      <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Stock Levels</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.round(((stats?.totalItems || 0) - (stats?.outOfStockCount || 0)) / (stats?.totalItems || 1) * 100)}%
                  </span>
                </div>

                {/* Return Rate */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Return Rate</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {(stats?.returnRate || 0).toFixed(1)}%
                  </span>
                </div>

                {/* Low Stock */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Low Stock Items</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {lowStockCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
