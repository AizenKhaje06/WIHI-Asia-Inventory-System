"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, BarChart3, Package, DollarSign, Percent, Download, RefreshCw, TrendingUpIcon, Search, X } from "lucide-react"
import type { ABCAnalysis, InventoryTurnover, PredictiveAnalytics } from "@/lib/types"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function InsightsPage() {
  const [abcAnalysis, setAbcAnalysis] = useState<ABCAnalysis[]>([])
  const [turnover, setTurnover] = useState<InventoryTurnover[]>([])
  const [deadStock, setDeadStock] = useState<any[]>([])
  const [profitMargin, setProfitMargin] = useState<any[]>([])
  const [forecasts, setForecasts] = useState<PredictiveAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("abc")
  
  // Filter states
  const [abcSearch, setAbcSearch] = useState("")
  const [abcCategoryFilter, setAbcCategoryFilter] = useState("all")
  const [abcSortBy, setAbcSortBy] = useState("revenue-desc")
  
  const [turnoverSearch, setTurnoverSearch] = useState("")
  const [turnoverStatusFilter, setTurnoverStatusFilter] = useState("all")
  const [turnoverSortBy, setTurnoverSortBy] = useState("ratio-desc")
  
  const [forecastSearch, setForecastSearch] = useState("")
  const [forecastTrendFilter, setForecastTrendFilter] = useState("all")
  const [forecastSortBy, setForecastSortBy] = useState("demand-desc")
  
  const [profitSearch, setProfitSearch] = useState("")
  const [profitSortBy, setProfitSortBy] = useState("margin-desc")
  
  const [deadStockSearch, setDeadStockSearch] = useState("")
  const [deadStockCategoryFilter, setDeadStockCategoryFilter] = useState("all")
  const [deadStockSortBy, setDeadStockSortBy] = useState("value-desc")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const [analyticsRes, forecastRes] = await Promise.all([
        fetch("/api/analytics?type=all"),
        fetch("/api/analytics?type=forecast")
      ])

      const analyticsData = await analyticsRes.json()
      const forecastData = await forecastRes.json()

      setAbcAnalysis(analyticsData.abc || [])
      setTurnover(analyticsData.turnover || [])
      setDeadStock(analyticsData.deadStock || [])
      setProfitMargin(analyticsData.profitMargin || [])
      setForecasts(Array.isArray(forecastData) ? forecastData : [])
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV(data: any[], filename: string, headers: string[]) {
    if (data.length === 0) return

    const rows = data.map(item => {
      if (activeTab === 'abc') {
        return [item.itemName, item.category, item.revenueContribution, item.recommendation]
      } else if (activeTab === 'turnover') {
        return [item.itemName, item.turnoverRatio, item.daysToSell, item.status]
      } else if (activeTab === 'forecast') {
        return [item.itemName, item.predictedDemand, item.recommendedReorderQty, item.trend, item.confidence]
      } else if (activeTab === 'profit') {
        return [item.category, item.revenue, item.profit, item.margin]
      } else if (activeTab === 'deadstock') {
        return [item.name, item.category, item.quantity, item.quantity * item.costPrice]
      }
      return []
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fast-moving': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'slow-moving': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'dead-stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'B': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'C': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

  const abcChartData = [
    { name: 'A Items', value: abcAnalysis.filter(a => a.category === 'A').length },
    { name: 'B Items', value: abcAnalysis.filter(a => a.category === 'B').length },
    { name: 'C Items', value: abcAnalysis.filter(a => a.category === 'C').length },
  ]

  const turnoverChartData = [
    { name: 'Fast Moving', value: turnover.filter(t => t.status === 'fast-moving').length },
    { name: 'Normal', value: turnover.filter(t => t.status === 'normal').length },
    { name: 'Slow Moving', value: turnover.filter(t => t.status === 'slow-moving').length },
    { name: 'Dead Stock', value: turnover.filter(t => t.status === 'dead-stock').length },
  ]

  // Calculate stats
  const totalItems = abcAnalysis.length
  const categoryAItems = abcAnalysis.filter(a => a.category === 'A').length
  const avgTurnoverRatio = turnover.length > 0 
    ? turnover.reduce((sum, t) => sum + t.turnoverRatio, 0) / turnover.length 
    : 0
  const totalDeadStockValue = deadStock.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)

  // Filtered data
  const filteredAbcAnalysis = abcAnalysis
    .filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(abcSearch.toLowerCase())
      const matchesCategory = abcCategoryFilter === "all" || item.category === abcCategoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (abcSortBy === "revenue-desc") return b.revenueContribution - a.revenueContribution
      if (abcSortBy === "revenue-asc") return a.revenueContribution - b.revenueContribution
      if (abcSortBy === "name-asc") return a.itemName.localeCompare(b.itemName)
      return 0
    })

  const filteredTurnover = turnover
    .filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(turnoverSearch.toLowerCase())
      const matchesStatus = turnoverStatusFilter === "all" || item.status === turnoverStatusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (turnoverSortBy === "ratio-desc") return b.turnoverRatio - a.turnoverRatio
      if (turnoverSortBy === "ratio-asc") return a.turnoverRatio - b.turnoverRatio
      if (turnoverSortBy === "days-asc") return a.daysToSell - b.daysToSell
      if (turnoverSortBy === "name-asc") return a.itemName.localeCompare(b.itemName)
      return 0
    })

  const filteredForecasts = forecasts
    .filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(forecastSearch.toLowerCase())
      const matchesTrend = forecastTrendFilter === "all" || item.trend === forecastTrendFilter
      return matchesSearch && matchesTrend
    })
    .sort((a, b) => {
      if (forecastSortBy === "demand-desc") return b.predictedDemand - a.predictedDemand
      if (forecastSortBy === "demand-asc") return a.predictedDemand - b.predictedDemand
      if (forecastSortBy === "confidence-desc") return b.confidence - a.confidence
      if (forecastSortBy === "name-asc") return a.itemName.localeCompare(b.itemName)
      return 0
    })

  const filteredProfitMargin = profitMargin
    .filter(item => item.category.toLowerCase().includes(profitSearch.toLowerCase()))
    .sort((a, b) => {
      if (profitSortBy === "margin-desc") return b.margin - a.margin
      if (profitSortBy === "margin-asc") return a.margin - b.margin
      if (profitSortBy === "revenue-desc") return b.revenue - a.revenue
      if (profitSortBy === "profit-desc") return b.profit - a.profit
      return 0
    })

  const filteredDeadStock = deadStock
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(deadStockSearch.toLowerCase())
      const matchesCategory = deadStockCategoryFilter === "all" || item.category === deadStockCategoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (deadStockSortBy === "value-desc") return (b.quantity * b.costPrice) - (a.quantity * a.costPrice)
      if (deadStockSortBy === "value-asc") return (a.quantity * a.costPrice) - (b.quantity * b.costPrice)
      if (deadStockSortBy === "quantity-desc") return b.quantity - a.quantity
      if (deadStockSortBy === "name-asc") return a.name.localeCompare(b.name)
      return 0
    })

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading insights...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Business Insights
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          AI-powered analytics and strategic recommendations for data-driven decisions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(totalItems)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Analyzed Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                Category A
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(categoryAItems)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">High Value Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUpIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                Avg
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {avgTurnoverRatio.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Turnover Ratio</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                Dead Stock
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(totalDeadStockValue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Value at Risk</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-1 rounded-lg">
            <TabsTrigger 
              value="abc"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              ABC Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="turnover"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              Turnover
            </TabsTrigger>
            <TabsTrigger 
              value="forecast"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              Forecast
            </TabsTrigger>
            <TabsTrigger 
              value="profit"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              Profit
            </TabsTrigger>
            <TabsTrigger 
              value="deadstock"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
            >
              Dead Stock
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                if (activeTab === 'abc') {
                  exportToCSV(filteredAbcAnalysis, 'abc-analysis', ['Product', 'Category', 'Revenue %', 'Recommendation'])
                } else if (activeTab === 'turnover') {
                  exportToCSV(filteredTurnover, 'inventory-turnover', ['Product', 'Turnover Ratio', 'Days to Sell', 'Status'])
                } else if (activeTab === 'forecast') {
                  exportToCSV(filteredForecasts, 'sales-forecast', ['Product', 'Predicted Demand', 'Recommended Reorder', 'Trend', 'Confidence'])
                } else if (activeTab === 'profit') {
                  exportToCSV(filteredProfitMargin, 'profit-margins', ['Category', 'Revenue', 'Profit', 'Margin %'])
                } else if (activeTab === 'deadstock') {
                  exportToCSV(filteredDeadStock, 'dead-stock', ['Product', 'Category', 'Quantity', 'Value'])
                }
              }}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={
                (activeTab === 'abc' && filteredAbcAnalysis.length === 0) ||
                (activeTab === 'turnover' && filteredTurnover.length === 0) ||
                (activeTab === 'forecast' && filteredForecasts.length === 0) ||
                (activeTab === 'profit' && filteredProfitMargin.length === 0) ||
                (activeTab === 'deadstock' && filteredDeadStock.length === 0)
              }
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* ABC Analysis */}
        <TabsContent value="abc" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                    <Target className="h-5 w-5" />
                  </div>
                  ABC Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={abcChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {abcChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white">ABC Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">Category A</span>
                      <Badge className="bg-green-600 text-white border-0">High Value</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'A').length} items • ~80% of revenue
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">Category B</span>
                      <Badge className="bg-blue-600 text-white border-0">Medium Value</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'B').length} items • ~15% of revenue
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">Category C</span>
                      <Badge className="bg-amber-600 text-white border-0">Low Value</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'C').length} items • ~5% of revenue
                    </p>
                  </div>
                </div>
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
                      placeholder="Search products..."
                      value={abcSearch}
                      onChange={(e) => setAbcSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Category</Label>
                  <Select value={abcCategoryFilter} onValueChange={setAbcCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="A">Category A</SelectItem>
                      <SelectItem value="B">Category B</SelectItem>
                      <SelectItem value="C">Category C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                  <Select value={abcSortBy} onValueChange={setAbcSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue-desc">Revenue % (High to Low)</SelectItem>
                      <SelectItem value="revenue-asc">Revenue % (Low to High)</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(abcSearch || abcCategoryFilter !== "all") && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredAbcAnalysis.length} of {abcAnalysis.length} items
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAbcSearch("")
                      setAbcCategoryFilter("all")
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-white">Detailed ABC Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                        <th className="pb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Revenue %</th>
                        <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAbcAnalysis.slice(0, 20).map((item) => (
                        <tr key={item.itemId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                          <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{item.itemName}</td>
                          <td className="py-4 text-center">
                            <Badge className={`${getCategoryColor(item.category)} border`}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {item.revenueContribution.toFixed(2)}%
                          </td>
                          <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                            {item.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Turnover */}
        <TabsContent value="turnover" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white">Turnover Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnoverChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Turnover Ratio</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {avgTurnoverRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fast Moving Items</span>
                    <span className="text-lg font-bold text-green-600">
                      {turnover.filter(t => t.status === 'fast-moving').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Slow Moving Items</span>
                    <span className="text-lg font-bold text-amber-600">
                      {turnover.filter(t => t.status === 'slow-moving').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dead Stock Items</span>
                    <span className="text-lg font-bold text-red-600">
                      {turnover.filter(t => t.status === 'dead-stock').length}
                    </span>
                  </div>
                </div>
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
                      placeholder="Search products..."
                      value={turnoverSearch}
                      onChange={(e) => setTurnoverSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Status</Label>
                  <Select value={turnoverStatusFilter} onValueChange={setTurnoverStatusFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="fast-moving">Fast Moving</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="slow-moving">Slow Moving</SelectItem>
                      <SelectItem value="dead-stock">Dead Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                  <Select value={turnoverSortBy} onValueChange={setTurnoverSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ratio-desc">Turnover Ratio (High to Low)</SelectItem>
                      <SelectItem value="ratio-asc">Turnover Ratio (Low to High)</SelectItem>
                      <SelectItem value="days-asc">Days to Sell (Low to High)</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(turnoverSearch || turnoverStatusFilter !== "all") && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredTurnover.length} of {turnover.length} items
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTurnoverSearch("")
                      setTurnoverStatusFilter("all")
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-white">Inventory Turnover Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Turnover Ratio</th>
                        <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Days to Sell</th>
                        <th className="pb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTurnover.slice(0, 20).map((item) => (
                        <tr key={item.itemId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                          <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{item.itemName}</td>
                          <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">{item.turnoverRatio}</td>
                          <td className="py-4 text-right text-slate-600 dark:text-slate-400">{item.daysToSell}</td>
                          <td className="py-4 text-center">
                            <Badge className={`${getStatusColor(item.status)} border`}>
                              {item.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Forecast */}
        <TabsContent value="forecast" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search products..."
                      value={forecastSearch}
                      onChange={(e) => setForecastSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Trend</Label>
                  <Select value={forecastTrendFilter} onValueChange={setForecastTrendFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trends</SelectItem>
                      <SelectItem value="increasing">Increasing</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="decreasing">Decreasing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                  <Select value={forecastSortBy} onValueChange={setForecastSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demand-desc">Predicted Demand (High to Low)</SelectItem>
                      <SelectItem value="demand-asc">Predicted Demand (Low to High)</SelectItem>
                      <SelectItem value="confidence-desc">Confidence (High to Low)</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(forecastSearch || forecastTrendFilter !== "all") && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredForecasts.length} of {forecasts.length} items
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForecastSearch("")
                      setForecastTrendFilter("all")
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Predictive Sales Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredForecasts.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Forecast Data</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Forecast data will appear here once enough sales history is available.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <div className="min-w-full inline-block align-middle">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                          <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Predicted Demand</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Recommended Reorder</th>
                          <th className="pb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Trend</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredForecasts.slice(0, 20).map((item) => (
                          <tr key={item.itemId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                            <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{item.itemName}</td>
                            <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">{item.predictedDemand}</td>
                            <td className="py-4 text-right font-bold text-blue-600">{item.recommendedReorderQty}</td>
                            <td className="py-4 text-center">{getTrendIcon(item.trend)}</td>
                            <td className="py-4 text-right text-slate-600 dark:text-slate-400">{item.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Margins */}
        <TabsContent value="profit" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search categories..."
                      value={profitSearch}
                      onChange={(e) => setProfitSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                  <Select value={profitSortBy} onValueChange={setProfitSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="margin-desc">Margin % (High to Low)</SelectItem>
                      <SelectItem value="margin-asc">Margin % (Low to High)</SelectItem>
                      <SelectItem value="revenue-desc">Revenue (High to Low)</SelectItem>
                      <SelectItem value="profit-desc">Profit (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {profitSearch && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredProfitMargin.length} of {profitMargin.length} items
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProfitSearch("")}
                    className="h-7 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-white">Profit Margin by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProfitMargin.length === 0 ? (
                <div className="text-center py-12">
                  <Percent className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Profit Data</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Profit margin data will appear here once sales are recorded.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredProfitMargin}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="margin" fill="#10B981" name="Profit Margin %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {filteredProfitMargin.length > 0 && (
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 px-6">
                  <div className="min-w-full inline-block align-middle">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                          <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Profit</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfitMargin.map((item, index) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                            <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{item.category}</td>
                            <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(item.revenue)}</td>
                            <td className="py-4 text-right font-bold text-green-600">{formatCurrency(item.profit)}</td>
                            <td className="py-4 text-right font-bold text-slate-800 dark:text-slate-200">{item.margin.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dead Stock */}
        <TabsContent value="deadstock" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search products..."
                      value={deadStockSearch}
                      onChange={(e) => setDeadStockSearch(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Category</Label>
                  <Select value={deadStockCategoryFilter} onValueChange={setDeadStockCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(deadStock.map(item => item.category))).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Sort By</Label>
                  <Select value={deadStockSortBy} onValueChange={setDeadStockSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                      <SelectItem value="value-asc">Value (Low to High)</SelectItem>
                      <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(deadStockSearch || deadStockCategoryFilter !== "all") && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {filteredDeadStock.length} of {deadStock.length} items
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeadStockSearch("")
                      setDeadStockCategoryFilter("all")
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Dead Stock Alert ({filteredDeadStock.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDeadStock.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Dead Stock Found!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Excellent! All items are moving well. Keep up the good inventory management.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <div className="min-w-full inline-block align-middle">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                          <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                          <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quantity</th>
                          <th className="pb-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Value</th>
                          <th className="pb-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeadStock.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                            <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                            <td className="py-4 text-right font-semibold text-slate-800 dark:text-slate-200">{item.quantity}</td>
                            <td className="py-4 text-right font-bold text-red-600">{formatCurrency(item.quantity * item.costPrice)}</td>
                            <td className="py-4">
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 border">
                                Consider Discount/Removal
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
