"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, DollarSign, TrendingUp, BarChart3, ShoppingCart, TrendingDown, Users, BarChart2, Activity, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import type { DashboardStats, InventoryItem, Transaction } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<"ID" | "1W" | "1M">("ID")

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, itemsRes] = await Promise.all([fetch(`/api/dashboard?period=${timePeriod}`), fetch("/api/items")])

        const statsData = await statsRes.json()
        const itemsData = await itemsRes.json()

        setStats(statsData)
        setLowStockItems(itemsData.filter((item: InventoryItem) => item.quantity <= item.reorderLevel))
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timePeriod])

  if (loading) {
    return (
      <div className="responsive-padding min-h-screen">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <ShimmerSkeleton variant="chart" className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Format date based on timePeriod
  const formattedSalesData = stats?.salesOverTime?.map(item => {
    let displayDate = item.date
    if (timePeriod === "ID") {
      displayDate = item.date.split(' ')[1] // Keep only time part for today
    } else if (timePeriod === "1W" || timePeriod === "1M") {
      displayDate = new Date(item.date.split(' ')[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return { ...item, date: displayDate }
  }) || []

  const topCategoriesData = stats?.topCategories?.map((cat) => ({
    name: cat.name,
    sales: cat.sales,
  })) || []

  const categoryStatsData = [
    { name: 'Total Categories', value: stats?.totalCategories || 0 },
    { name: 'Total Products', value: stats?.totalProducts || 0 },
  ]

  const stockPercentageData = stats?.stockPercentageByCategory?.map((cat) => ({
    name: cat.name,
    percentage: cat.percentage,
  })) || []

  const stocksCountData = stats?.stocksCountByCategory?.map((cat) => ({
    name: cat.name,
    count: cat.count,
  })) || []

  const stocksCountByStorageRoomData = stats?.stocksCountByStorageRoom?.map((room) => ({
    name: room.name,
    count: room.count,
  })) || []

  return (
    <div className="responsive-padding min-h-screen">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="responsive-text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">
          Executive Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Comprehensive overview of your inventory management system</p>
      </div>

      {/* Sales & Purchase Chart */}
      <Card className={cn("mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100", "dark:card-neon")}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              Sales & Purchase Analytics
            </CardTitle>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
              <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <TabsTrigger value="ID" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Today</TabsTrigger>
                <TabsTrigger value="1W" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">1W</TabsTrigger>
                <TabsTrigger value="1M" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">1M</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                content={<ChartTooltip formatter={(value, name) => [`₱${formatNumber(value)}`, name]} />}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fill="url(#salesGradient)" name="Sales Revenue" />
              <Area type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={3} fill="url(#purchaseGradient)" name="Purchase Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Stocks Value</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              <AnimatedNumber value={stats?.totalValue || 0} prefix="₱" duration={2000} />
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
              <AnimatedNumber value={stats?.totalRevenue || 0} prefix="₱" duration={2000} />
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
              <AnimatedNumber value={stats?.totalCost || 0} prefix="₱" duration={2000} />
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
              <AnimatedNumber value={stats?.profitMargin || 0} suffix="%" decimals={1} duration={2000} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Top Products */}
        <Card className={cn("border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-600", "dark:card-neon")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topProducts?.map((product, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{product.sales.toLocaleString()}</span>
                    <div className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium">
                      +{Math.floor(Math.random() * 20 + 5)}%
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-500 dark:text-slate-400 text-center py-8">No data available</p>}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className={cn("border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-700", "dark:card-neon")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Stock Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.slice(0, 4).map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{item.quantity}</span>
                    <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium">
                      {item.quantity === 0 ? "Out of Stock" : "Low"}
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-500 dark:text-slate-400 text-center py-8">All items well stocked</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className={cn("border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-800", "dark:card-neon")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                <ShoppingCart className="h-4 w-4" />
              </div>
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions?.map((tx, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tx.itemName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">₱{formatNumber(tx.totalRevenue)}</span>
                    <div className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      Sale
                    </div>
                  </div>
                </div>
              )) || <p className="text-slate-500 dark:text-slate-400 text-center py-8">No recent transactions</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Stock Percentage Bar Chart */}
        <Card className={cn("border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-900", "dark:card-neon")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                <BarChart2 className="h-4 w-4" />
              </div>
              Stock Count by Storage Room
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stocksCountByStorageRoomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />}
                />
                <Bar dataKey="count" fill="url(#stockPercentageGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="stockPercentageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stocks Count Bar Chart */}
        <Card className={cn("border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-1000", "dark:card-neon")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                <Activity className="h-4 w-4" />
              </div>
              Stocks Count by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stocksCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />}
                />
                <Bar dataKey="count" fill="url(#stocksCountGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="stocksCountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
