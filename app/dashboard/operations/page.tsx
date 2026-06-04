"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, ShoppingCart, PackageX, TrendingUp, RefreshCw, RotateCcw, DollarSign, Percent, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import type { InventoryItem, DashboardStats } from "@/lib/types"
import type { TimePeriod } from "@/components/dashboard/revenue-chart"
import { cn } from "@/lib/utils"
import { apiGet } from "@/lib/api-client"
import { EnterpriseDateRangePicker } from "@/components/ui/enterprise-date-range-picker"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatChartData, calculatePeriodComparison } from "@/lib/dashboard-utils"

interface Order {
  id: string
  qty: number
  total: number
  parcel_status: string
  sales_channel: string
  status: string
}

export default function OperationsDashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("ID")

  const fetchData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch inventory items
      const itemsData = await apiGet<InventoryItem[]>("/api/items")
      setItems(Array.isArray(itemsData) ? itemsData : [])
      
      // Build API URL with date filters if provided
      let ordersUrl = "/api/orders?status=Packed" // Only fetch packed orders (same as Admin Dashboard)
      const ordersParams = new URLSearchParams()
      ordersParams.append('status', 'Packed')
      
      if (startDate) {
        ordersParams.append('startDate', startDate.toISOString())
      }
      if (endDate) {
        ordersParams.append('endDate', endDate.toISOString())
      }
      
      ordersUrl = `/api/orders?${ordersParams.toString()}`
      
      // Fetch packed orders only (department filtering is handled by API)
      const ordersData = await apiGet<Order[]>(ordersUrl)
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      
      // Fetch dashboard stats for revenue chart (department filtering is handled by API)
      let dashboardUrl = `/api/dashboard?period=${timePeriod}`
      if (startDate) {
        dashboardUrl += `&startDate=${startDate.toISOString()}`
      }
      if (endDate) {
        dashboardUrl += `&endDate=${endDate.toISOString()}`
      }
      
      const dashboardData = await apiGet<DashboardStats>(dashboardUrl)
      setStats(dashboardData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setItems([])
      setOrders([])
      setStats(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, timePeriod])

  // Calculate inventory metrics (not affected by date filter - current status)
  const totalItems = items.length
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel)
  const outOfStockItems = items.filter(item => item.quantity === 0)
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0)
  
  // Calculate order-based metrics (affected by date filter)
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const pendingOrders = orders.filter(order => order.status === 'Pending')
  const pendingCount = pendingOrders.length
  const packedOrders = orders.filter(order => order.status === 'Packed' || order.status === 'Shipped' || order.status === 'Delivered')
  const packedCount = packedOrders.length
  const returnedOrders = orders.filter(order => order.parcel_status === 'RETURNED')
  const returnedCount = returnedOrders.length
  const returnedAmount = returnedOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const returnRate = totalOrders > 0 ? (returnedCount / totalOrders) * 100 : 0
  const deliveredOrders = orders.filter(order => order.parcel_status === 'DELIVERED')
  const totalDelivered = deliveredOrders.length
  const deliveredPercentage = totalOrders > 0 ? (totalDelivered / totalOrders) * 100 : 0
  
  // Calculate financial metrics - use stats if available, otherwise calculate from orders
  const totalQuantitySold = orders.reduce((sum, order) => sum + (order.qty || 0), 0)
  const netProfit = stats?.totalProfit ?? (totalRevenue - returnedAmount)
  const totalSold = stats?.totalSales ?? totalQuantitySold
  const profitMargin = stats?.profitMargin ?? (totalRevenue > 0 ? ((totalRevenue - returnedAmount) / totalRevenue) * 100 : 0)

  // Debug logging
  console.log('[Operations Dashboard] Financial Metrics Debug:', {
    ordersCount: orders.length,
    totalRevenue,
    returnedAmount,
    totalQuantitySold,
    statsFromAPI: {
      totalProfit: stats?.totalProfit,
      totalSales: stats?.totalSales,
      profitMargin: stats?.profitMargin
    },
    calculated: {
      netProfit,
      totalSold,
      profitMargin
    }
  })

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Operations Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">Quick overview of inventory and operations</p>
        </div>
        <EnterpriseDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
        />
      </div>

      {/* Key Metrics - 5 Primary KPIs - Professional Corporate Design */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              ₱<AnimatedNumber value={totalRevenue} duration={1500} />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Total Revenue</div>
            {startDate || endDate ? (
              totalRevenue > 0 ? (
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
              <div className="text-xs text-slate-500 dark:text-slate-400">
                All-time revenue
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
              ₱<AnimatedNumber value={netProfit} duration={1500} />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Gross Profit</div>
            {returnedAmount > 0 ? (
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  ₱{returnedAmount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} returns
                </span>
              </div>
            ) : (
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                No returns
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sold */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              <AnimatedNumber value={totalSold} duration={1500} />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Total Sold</div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {startDate || endDate ? 'Filtered period' : 'All-time quantity'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-700 bg-clip-text text-transparent mb-2">
              <AnimatedNumber value={profitMargin} decimals={1} duration={1500} />%
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">Profit Margin</div>
            <div className="flex items-center gap-1">
              {profitMargin >= 30 ? (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">🏆 Excellent!</span>
              ) : profitMargin >= 15 ? (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">✓ Good</span>
              ) : (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">⚠ Improve</span>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Secondary Metrics - 4 Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-125">
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={totalDelivered} duration={1000} />
                </div>
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">Total Delivered</div>
                {totalOrders > 0 && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    {deliveredPercentage.toFixed(1)}% of orders
                  </div>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400 dark:text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <AnimatedNumber value={lowStockItems.length} duration={1000} />
                </div>
                <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1">Low Stock</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400 dark:text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  <AnimatedNumber value={outOfStockItems.length} duration={1000} />
                </div>
                <div className="text-xs font-medium text-red-700 dark:text-red-300 mt-1">Out of Stock</div>
              </div>
              <PackageX className="h-8 w-8 text-red-400 dark:text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  <AnimatedNumber value={returnedCount} duration={1000} />
                </div>
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2">Total Returns</div>
                {returnedCount > 0 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    ₱{returnedAmount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <RotateCcw className="h-8 w-8 text-orange-400 dark:text-orange-500 opacity-50" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {returnRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Return Rate
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Statistics - Affected by Date Filter */}
      {(startDate || endDate) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Order Statistics {startDate && endDate ? `(${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})` : '(Filtered Period)'}
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                <AnimatedNumber value={totalOrders} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-green-100 dark:border-green-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Revenue</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ₱<AnimatedNumber value={totalRevenue} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">To Pack</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                <AnimatedNumber value={pendingCount} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Completed</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                <AnimatedNumber value={packedCount} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart - Same as Admin Dashboard */}
      <RevenueChart
        data={formatChartData(stats?.salesOverTime, timePeriod)}
        timePeriod={timePeriod}
        onPeriodChange={setTimePeriod}
        comparison={calculatePeriodComparison(stats, timePeriod)}
        loading={refreshing}
      />

      {/* Quick Tips */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Operational Alerts & Tips</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time insights for your department</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Low Stock Alert</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                    <span className="font-semibold">{lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''}</span> near reorder level. Coordinate with admin for restocking.
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1.5 font-medium">
                    {lowStockItems.slice(0, 3).map(i => i.name).join(', ')}{lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">Stock Levels Healthy</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5 leading-relaxed">
                    All products are above their reorder levels. Keep monitoring daily.
                  </p>
                </div>
              </div>
            )}

            {/* Out of Stock */}
            {outOfStockItems.length > 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                  <PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">Out of Stock</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                    <span className="font-semibold">{outOfStockItems.length} product{outOfStockItems.length > 1 ? 's' : ''}</span> are fully depleted. Avoid accepting orders for these items.
                  </p>
                  <p className="text-[11px] text-red-600 dark:text-red-500 mt-1.5 font-medium">
                    {outOfStockItems.slice(0, 3).map(i => i.name).join(', ')}{outOfStockItems.length > 3 ? ` +${outOfStockItems.length - 3} more` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">No Out-of-Stock Items</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5 leading-relaxed">
                    All products are available. Great inventory management!
                  </p>
                </div>
              </div>
            )}

            {/* Returns Alert */}
            {returnedCount > 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/40">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <RotateCcw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-800 dark:text-orange-300">Returns Recorded</p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5 leading-relaxed">
                    <span className="font-semibold">{returnedCount} return{returnedCount > 1 ? 's' : ''}</span> in the selected period with a <span className="font-semibold">{returnRate.toFixed(1)}% return rate</span>. Review reasons with your team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">No Returns</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
                    Zero returns in this period. Excellent order fulfillment quality!
                  </p>
                </div>
              </div>
            )}

            {/* Inventory Check Reminder */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                <RefreshCw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Daily Inventory Check</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Regular stock counts help maintain data accuracy. Report any discrepancies to the admin immediately.
                </p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
