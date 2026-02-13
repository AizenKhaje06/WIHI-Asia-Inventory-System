"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Monitor, Users, Search, RefreshCw, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { apiGet } from "@/lib/api-client"

export default function InternalUsagePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "demo" | "internal">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchInternalUsage()
  }, [])

  async function fetchInternalUsage() {
    setLoading(true)
    try {
      const data = await apiGet<{ transactions: Transaction[] }>("/api/internal-usage")
      console.log('[Internal Usage] Fetched transactions:', data.transactions)
      console.log('[Internal Usage] Transaction count:', data.transactions?.length || 0)
      
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Error fetching internal usage:", error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || 
                       (filterType === "demo" && t.transactionType === "demo") ||
                       (filterType === "internal" && t.transactionType === "internal")
    
    const transactionDate = new Date(t.timestamp)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = transactionDate >= today
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDate = transactionDate >= weekAgo
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      matchesDate = transactionDate >= monthAgo
    }
    
    return matchesSearch && matchesType && matchesDate
  })

  // Calculate statistics
  const demoTransactions = filteredTransactions.filter(t => t.transactionType === "demo")
  const internalTransactions = filteredTransactions.filter(t => t.transactionType === "internal")
  
  const demoQuantity = demoTransactions.reduce((sum, t) => sum + t.quantity, 0)
  const internalQuantity = internalTransactions.reduce((sum, t) => sum + t.quantity, 0)
  
  const demoValue = demoTransactions.reduce((sum, t) => sum + t.totalCost, 0)
  const internalValue = internalTransactions.reduce((sum, t) => sum + t.totalCost, 0)

  // Top items by usage type - use ALL transactions for accurate top items
  const topDemoItems = transactions
    .filter(t => t.transactionType === "demo")
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.itemName)
      if (existing) {
        existing.quantity += t.quantity
        existing.value += t.totalCost
      } else {
        acc.push({ name: t.itemName, quantity: t.quantity, value: t.totalCost })
      }
      return acc
    }, [] as { name: string; quantity: number; value: number }[])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  const topInternalItems = transactions
    .filter(t => t.transactionType === "internal")
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.itemName)
      if (existing) {
        existing.quantity += t.quantity
        existing.value += t.totalCost
      } else {
        acc.push({ name: t.itemName, quantity: t.quantity, value: t.totalCost })
      }
      return acc
    }, [] as { name: string; quantity: number; value: number }[])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Usage by department - for Sales Channels tab, parse combined format
  const usageByDepartment = filteredTransactions.reduce((acc, t) => {
    let dept = t.department || "Unknown"
    
    // Parse combined format: "Demo/Display / Tiktok" or "Internal Use / Lazada"
    if (dept.includes(' / ')) {
      const parts = dept.split(' / ')
      dept = parts[1] || parts[0] // Use sales channel part
    }
    
    const existing = acc.find(item => item.department === dept)
    if (existing) {
      existing.demo += t.transactionType === "demo" ? t.quantity : 0
      existing.internal += t.transactionType === "internal" ? t.quantity : 0
      existing.demoValue += t.transactionType === "demo" ? t.totalCost : 0
      existing.internalValue += t.transactionType === "internal" ? t.totalCost : 0
    } else {
      acc.push({
        department: dept,
        demo: t.transactionType === "demo" ? t.quantity : 0,
        internal: t.transactionType === "internal" ? t.quantity : 0,
        demoValue: t.transactionType === "demo" ? t.totalCost : 0,
        internalValue: t.transactionType === "internal" ? t.totalCost : 0
      })
    }
    return acc
  }, [] as { department: string; demo: number; internal: number; demoValue: number; internalValue: number }[])
    .filter(d => {
      // Exclude non-sales destinations from Sales Channels tab
      const nonSalesDestinations = ['Demo/Display', 'Internal Use', 'Warehouse', 'Unknown']
      return !nonSalesDestinations.includes(d.department)
    })
    .sort((a, b) => (b.demo + b.internal) - (a.demo + a.internal))

  // Daily usage trend (last 7 days) - use ALL transactions, not filtered
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const dailyUsage = last7Days.map(date => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Use ALL transactions for trend, not filtered
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.timestamp)
      return tDate >= date && tDate < nextDay
    })
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      demo: dayTransactions.filter(t => t.transactionType === "demo").reduce((sum, t) => sum + t.quantity, 0),
      internal: dayTransactions.filter(t => t.transactionType === "internal").reduce((sum, t) => sum + t.quantity, 0)
    }
  })

  // Pie chart data
  const pieData = [
    { name: 'Demo/Display', value: demoQuantity, color: '#A855F7' },
    { name: 'Internal Use', value: internalQuantity, color: '#3B82F6' }
  ]

  const COLORS = ['#A855F7', '#3B82F6']

  // Monthly comparison (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    return date
  })

  console.log('[Internal Usage] Calculating monthly comparison...')
  console.log('[Internal Usage] Total transactions:', transactions.length)

  const monthlyComparison = last6Months.map(date => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.timestamp)
      return tDate >= monthStart && tDate <= monthEnd
    })
    
    console.log(`[Internal Usage] ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: ${monthTransactions.length} transactions`)
    
    const demoQty = monthTransactions.filter(t => t.transactionType === "demo").reduce((sum, t) => sum + t.quantity, 0)
    const internalQty = monthTransactions.filter(t => t.transactionType === "internal").reduce((sum, t) => sum + t.quantity, 0)
    const demoVal = monthTransactions.filter(t => t.transactionType === "demo").reduce((sum, t) => sum + t.totalCost, 0)
    const internalVal = monthTransactions.filter(t => t.transactionType === "internal").reduce((sum, t) => sum + t.totalCost, 0)
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      demoQty,
      internalQty,
      demoValue: demoVal,
      internalValue: internalVal,
      total: demoQty + internalQty
    }
  })

  console.log('[Internal Usage] Monthly comparison data:', monthlyComparison)

  // Staff usage tracking
  console.log('[Internal Usage] Calculating staff usage...')
  const staffUsage = filteredTransactions.reduce((acc, t) => {
    const staff = t.staffName || "Unknown"
    const existing = acc.find(item => item.staff === staff)
    if (existing) {
      existing.demo += t.transactionType === "demo" ? t.quantity : 0
      existing.internal += t.transactionType === "internal" ? t.quantity : 0
      existing.demoValue += t.transactionType === "demo" ? t.totalCost : 0
      existing.internalValue += t.transactionType === "internal" ? t.totalCost : 0
      existing.transactions += 1
    } else {
      acc.push({
        staff,
        demo: t.transactionType === "demo" ? t.quantity : 0,
        internal: t.transactionType === "internal" ? t.quantity : 0,
        demoValue: t.transactionType === "demo" ? t.totalCost : 0,
        internalValue: t.transactionType === "internal" ? t.totalCost : 0,
        transactions: 1
      })
    }
    return acc
  }, [] as { staff: string; demo: number; internal: number; demoValue: number; internalValue: number; transactions: number }[])
    .sort((a, b) => (b.demo + b.internal) - (a.demo + a.internal))

  console.log('[Internal Usage] Staff usage data:', staffUsage)

  // Cost analysis
  const costAnalysis = {
    totalCost: demoValue + internalValue,
    demoCost: demoValue,
    internalCost: internalValue,
    demoPercentage: demoValue + internalValue > 0 ? (demoValue / (demoValue + internalValue)) * 100 : 0,
    internalPercentage: demoValue + internalValue > 0 ? (internalValue / (demoValue + internalValue)) * 100 : 0,
    avgDemoCost: demoTransactions.length > 0 ? demoValue / demoTransactions.length : 0,
    avgInternalCost: internalTransactions.length > 0 ? internalValue / internalTransactions.length : 0
  }

  // Cost breakdown by item
  const costByItem = filteredTransactions.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.itemName)
    if (existing) {
      existing.demoValue += t.transactionType === "demo" ? t.totalCost : 0
      existing.internalValue += t.transactionType === "internal" ? t.totalCost : 0
      existing.totalValue += t.totalCost
    } else {
      acc.push({
        name: t.itemName,
        demoValue: t.transactionType === "demo" ? t.totalCost : 0,
        internalValue: t.transactionType === "internal" ? t.totalCost : 0,
        totalValue: t.totalCost
      })
    }
    return acc
  }, [] as { name: string; demoValue: number; internalValue: number; totalValue: number }[])
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading internal usage data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Internal Usage Tracking</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Track items used for Demo/Display and Internal Company Use
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInternalUsage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <Monitor className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                Demo
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(demoQuantity)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Items for Demo/Display</div>
            {transactions.length === 0 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                No transactions yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Internal
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(internalQuantity)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Items for Internal Use</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(demoValue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Demo/Display Value</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(internalValue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Internal Use Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search items, department, staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Type</Label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="demo">Demo/Display Only</SelectItem>
                  <SelectItem value="internal">Internal Use Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Date Range</Label>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Data Alert */}
      {transactions.length === 0 && (
        <Card className="border-0 shadow-md bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">No Internal Usage Data Yet</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  To start tracking internal usage, dispatch items from the Warehouse Dispatch page:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                  <li>Go to <strong>Warehouse Dispatch</strong></li>
                  <li>Select items to dispatch</li>
                  <li>Choose department: <strong>"Demo/Display"</strong> or <strong>"Internal Use"</strong></li>
                  <li>Complete the dispatch</li>
                </ul>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  All demo and internal use transactions will automatically appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-700 dark:text-slate-300 shadow-sm gap-2">
          <TabsTrigger 
            value="overview" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:from-blue-600 dark:data-[state=active]:to-blue-500"
          >
            <PieChart className="h-4 w-4 mr-2.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="department" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:from-purple-600 dark:data-[state=active]:to-purple-500"
          >
            <BarChart3 className="h-4 w-4 mr-2.5" />
            Sales Channels
          </TabsTrigger>
          <TabsTrigger 
            value="cost" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:from-green-600 dark:data-[state=active]:to-green-500"
          >
            <TrendingUp className="h-4 w-4 mr-2.5" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:from-amber-600 dark:data-[state=active]:to-amber-500"
          >
            <Calendar className="h-4 w-4 mr-2.5" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Usage Distribution Pie Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-md">
                <PieChart className="h-5 w-5" />
              </div>
              Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Usage Trend */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                <TrendingUp className="h-5 w-5" />
              </div>
              7-Day Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyUsage.some(d => d.demo > 0 || d.internal > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyUsage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="internalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="demo" 
                    stroke="#A855F7" 
                    strokeWidth={2}
                    fill="url(#demoGradient)" 
                    name="Demo/Display"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="internal" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#internalGradient)" 
                    name="Internal Use"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Items and Department Usage */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Demo Items */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              Top Demo/Display Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDemoItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topDemoItems} 
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="demoBarGradient" x1="0" y1="0" x2="1" y2="0">
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
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Quantity']} />} />
                  <Bar 
                    dataKey="quantity" 
                    fill="url(#demoBarGradient)" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No demo items yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Internal Use Items */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Top Internal Use Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topInternalItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topInternalItems} 
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="internalBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                  <XAxis 
                    type="number"
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    className="fill-gray-600 dark:fill-gray-400" 
                    fontSize={11}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Quantity']} />} />
                  <Bar 
                    dataKey="quantity" 
                    fill="url(#internalBarGradient)" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No internal use items yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage by Department */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-[5px] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            Usage by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usageByDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={usageByDepartment} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                <XAxis 
                  dataKey="department" 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={10}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="fill-gray-600 dark:fill-gray-400" 
                  fontSize={11}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="demo" fill="#A855F7" name="Demo/Display" radius={[8, 8, 0, 0]} />
                <Bar dataKey="internal" fill="#3B82F6" name="Internal Use" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">No department data available</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Department Tracking Tab */}
        <TabsContent value="department" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-[5px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                  <Users className="h-5 w-5" />
                </div>
                Sales Channel Usage Summary
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Track which sales channels (TikTok, Lazada, Shopee, etc.) are using products for demo or internal purposes
              </p>
            </CardHeader>
            <CardContent>
              {usageByDepartment.length > 0 ? (
                <div className="space-y-6">
                  {/* Department Usage Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Sales Channel / Department</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Demo Qty</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Internal Qty</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Total Qty</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Total Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageByDepartment.map((dept, index) => {
                          const totalQty = dept.demo + dept.internal
                          const totalValue = dept.demoValue + dept.internalValue
                          const totalAllDepts = usageByDepartment.reduce((sum, d) => sum + d.demo + d.internal, 0)
                          const percentage = totalAllDepts > 0 ? (totalQty / totalAllDepts) * 100 : 0
                          
                          return (
                            <tr 
                              key={index}
                              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                                {dept.department}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-purple-600 dark:text-purple-400">
                                {formatNumber(dept.demo)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-blue-600 dark:text-blue-400">
                                {formatNumber(dept.internal)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                                {formatNumber(totalQty)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(totalValue)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">
                                {percentage.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 dark:border-slate-600 font-semibold">
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">TOTAL</td>
                          <td className="py-3 px-4 text-sm text-right text-purple-600 dark:text-purple-400">
                            {formatNumber(usageByDepartment.reduce((sum, d) => sum + d.demo, 0))}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-blue-600 dark:text-blue-400">
                            {formatNumber(usageByDepartment.reduce((sum, d) => sum + d.internal, 0))}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">
                            {formatNumber(usageByDepartment.reduce((sum, d) => sum + d.demo + d.internal, 0))}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(usageByDepartment.reduce((sum, d) => sum + d.demoValue + d.internalValue, 0))}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">
                            100%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Department Usage Chart */}
                  <Card className="border-0 shadow-md bg-slate-50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        Sales Channel Comparison
                      </CardTitle>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Compare demo vs internal usage across TikTok, Lazada, Shopee, and other channels
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={usageByDepartment} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
                          <XAxis 
                            dataKey="department" 
                            className="fill-gray-600 dark:fill-gray-400" 
                            fontSize={10}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            className="fill-gray-600 dark:fill-gray-400" 
                            fontSize={11}
                            tickLine={false}
                            width={40}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend />
                          <Bar dataKey="demo" fill="#A855F7" name="Demo/Display" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="internal" fill="#3B82F6" name="Internal Use" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Department Data</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No department usage records found for the selected filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="cost" className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(costAnalysis.totalCost)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Demo Cost</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(costAnalysis.demoCost)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {costAnalysis.demoPercentage.toFixed(1)}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Internal Cost</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(costAnalysis.internalCost)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {costAnalysis.internalPercentage.toFixed(1)}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Transaction Cost</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency((costAnalysis.demoCost + costAnalysis.internalCost) / (demoTransactions.length + internalTransactions.length || 1))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown by Item */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-[5px] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Cost Breakdown by Item (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costByItem.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Item</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Demo Cost</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Internal Cost</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Total Cost</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costByItem.map((item, index) => {
                        const percentage = costAnalysis.totalCost > 0 ? (item.totalValue / costAnalysis.totalCost) * 100 : 0
                        return (
                          <tr 
                            key={index}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-purple-600 dark:text-purple-400">
                              {formatCurrency(item.demoValue)}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.internalValue)}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(item.totalValue)}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Cost Data</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No cost records found for the selected filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Transactions Table */}
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Item</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Quantity</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Value</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Staff</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr 
                      key={index}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={cn(
                          "border-0",
                          transaction.transactionType === "demo" 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {transaction.transactionType === "demo" ? (
                            <>
                              <Monitor className="h-3 w-3 mr-1" />
                              Demo
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3 mr-1" />
                              Internal
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                        {transaction.itemName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">
                        {formatNumber(transaction.quantity)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(transaction.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.department || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.staffName || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Usage Records</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No demo or internal use transactions found for the selected filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
