"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, AlertTriangle, DollarSign, TrendingUp, BarChart3, ShoppingCart, TrendingDown, Users, BarChart2, Activity, ArrowUpRight, ArrowDownRight, Percent, RefreshCw, Download, Plus, FileText, AlertCircle, PackageX, PackageOpen } from "lucide-react"
import {
  LineChart,
  Line,
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
import type { DashboardStats, InventoryItem, Transaction } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { PremiumDashboardLoading } from "@/components/premium-loading"

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
      const [statsRes, itemsRes] = await Promise.all([
        fetch(`/api/dashboard?period=${timePeriod}`),
        fetch("/api/items")
      ])

      const statsData = await statsRes.json()
      const itemsData = await itemsRes.json()

      setStats(statsData)
      setLowStockItems(itemsData.filter((item: InventoryItem) => item.quantity > 0 && item.quantity <= item.reorderLevel))
      setOutOfStockItems(itemsData.filter((item: InventoryItem) => item.quantity === 0))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timePeriod])

  // Calculate additional metrics
  const grossProfit = (stats?.totalRevenue || 0) - (stats?.totalCost || 0)
  const lowStockCount = lowStockItems.length
  const outOfStockCount = outOfStockItems.length
  const totalProducts = (stats?.topProducts?.length || 0) + lowStockCount + outOfStockCount

  // Export dashboard data
  const exportDashboard = () => {
    const data = {
      period: timePeriod,
      metrics: {
        totalValue: stats?.totalValue || 0,
        totalRevenue: stats?.totalRevenue || 0,
        totalCost: stats?.totalCost || 0,
        profitMargin: stats?.profitMargin || 0,
        grossProfit,
        lowStockCount,
        outOfStockCount
      },
      topProducts: stats?.topProducts || [],
      lowStockItems: lowStockItems.slice(0, 10),
      recentTransactions: stats?.recentTransactions || []
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
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
      displayDate = item.date.split(' ')[1]
    } else if (timePeriod === "1W" || timePeriod === "1M") {
      displayDate = new Date(item.date.split(' ')[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return { ...item, date: displayDate }
  }) || []

  const stocksCountData = stats?.stocksCountByCategory?.map((cat) => ({
    name: cat.name,
    count: cat.count,
  })) || []

  const stocksCountByStorageRoomData = stats?.stocksCountByStorageRoom?.map((room) => ({
    name: room.name,
    count: room.count,
  })) || []

  return (
    <div className="space-y-6">
      {/* Page Header with Actions */}
      <div className="flex items-start justify-between mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportDashboard}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Metric Cards with Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        {/* Total Stock Value */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={stats?.totalValue || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Stock Value</div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={stats?.totalRevenue || 0} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={grossProfit} duration={1500} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Gross Profit</div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              <AnimatedNumber value={stats?.profitMargin || 0} decimals={1} duration={1500} />%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Profit Margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Critical Alerts */}
      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/inventory/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/pos">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  New Sale
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/inventory/low-stock">
                  <Package className="h-4 w-4 mr-2" />
                  Restock
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Critical Alerts
              {(outOfStockCount + lowStockCount) > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {outOfStockCount + lowStockCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockCount > 0 && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-red-700 dark:text-red-400">
                      {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} out of stock
                    </span>
                    <Button size="sm" variant="link" className="text-red-600 dark:text-red-400 h-auto p-0" asChild>
                      <Link href="/dashboard/inventory/out-of-stock">View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {lowStockCount > 0 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <PackageOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-400">
                      {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} below reorder level
                    </span>
                    <Button size="sm" variant="link" className="text-amber-600 dark:text-amber-400 h-auto p-0" asChild>
                      <Link href="/dashboard/inventory/low-stock">View</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {outOfStockCount === 0 && lowStockCount === 0 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">All inventory levels are healthy</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Sales & Purchase Analytics</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your revenue and costs over time</p>
            </div>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
              <TabsList>
                <TabsTrigger value="ID">Today</TabsTrigger>
                <TabsTrigger value="1W">Week</TabsTrigger>
                <TabsTrigger value="1M">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={formattedSalesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" className="fill-gray-600 dark:fill-gray-400" fontSize={12} />
              <YAxis className="fill-gray-600 dark:fill-gray-400" fontSize={12} />
              <Tooltip content={<ChartTooltip formatter={(value, name) => [`₱${formatNumber(Number(value))}`, name]} />} />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fill="url(#salesGradient)" name="Sales Revenue" />
              <Area type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} fill="url(#purchaseGradient)" name="Purchase Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topProducts?.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-sm font-semibold text-blue-600">{product.sales}</span>
                </div>
              )) || <p className="text-sm text-gray-500 text-center py-4">No data available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-semibold text-amber-600">{item.quantity}</span>
                </div>
              )) || <p className="text-sm text-gray-500 text-center py-4">All items well stocked</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentTransactions?.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-medium">{tx.itemName}</span>
                  <span className="text-sm font-semibold text-green-600">₱{formatNumber(tx.totalRevenue)}</span>
                </div>
              )) || <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Stock by Storage Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stocksCountByStorageRoomData} margin={{ bottom: 20 }}>
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
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
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

        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-green-600" />
              Stock by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stocksCountData} margin={{ bottom: 60 }}>
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
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
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
      </div>
    </div>
  )
}
