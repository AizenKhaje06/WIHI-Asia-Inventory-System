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
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import type { DashboardStats, InventoryItem, Transaction } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { PremiumDashboardLoading } from "@/components/premium-loading"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<"ID" | "1W" | "1M">("ID")

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          fetch(`/api/dashboard?period=${timePeriod}`),
          fetch("/api/items")
        ])

        const statsData = await statsRes.json()
        const itemsData = await itemsRes.json()

        setStats(statsData)
        setLowStockItems(itemsData.filter((item: InventoryItem) => item.quantity <= item.reorderLevel))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timePeriod])

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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-icon">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="metric-card-content">
            <div className="metric-card-value">
              ₱<AnimatedNumber value={stats?.totalValue || 0} duration={1500} />
            </div>
            <div className="metric-card-label">Total Stock Value</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-icon success">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="metric-card-content">
            <div className="metric-card-value">
              ₱<AnimatedNumber value={stats?.totalRevenue || 0} duration={1500} />
            </div>
            <div className="metric-card-label">Total Revenue</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-icon error">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="metric-card-content">
            <div className="metric-card-value">
              ₱<AnimatedNumber value={stats?.totalCost || 0} duration={1500} />
            </div>
            <div className="metric-card-label">Total Cost</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-icon warning">
              <Percent className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="metric-card-content">
            <div className="metric-card-value">
              <AnimatedNumber value={stats?.profitMargin || 0} decimals={1} duration={1500} />%
            </div>
            <div className="metric-card-label">Profit Margin</div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <Card>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip content={<ChartTooltip formatter={(value, name) => [`₱${formatNumber(value)}`, name]} />} />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fill="url(#salesGradient)" name="Sales Revenue" />
              <Area type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} fill="url(#purchaseGradient)" name="Purchase Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Stock by Storage Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stocksCountByStorageRoomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Stock by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stocksCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Count']} />} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
