"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, BarChart3 } from "lucide-react"
import type { ABCAnalysis, InventoryTurnover, PredictiveAnalytics } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function InsightsPage() {
  const [abcAnalysis, setAbcAnalysis] = useState<ABCAnalysis[]>([])
  const [turnover, setTurnover] = useState<InventoryTurnover[]>([])
  const [deadStock, setDeadStock] = useState<any[]>([])
  const [profitMargin, setProfitMargin] = useState<any[]>([])
  const [forecasts, setForecasts] = useState<PredictiveAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fast-moving': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'slow-moving': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'dead-stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'C': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
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

  if (loading) {
    return <div className="p-8">Loading insights...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Business Insights
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          AI-powered analytics for strategic decision making
        </p>
      </div>

      <Tabs defaultValue="abc" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
          <TabsTrigger value="abc">ABC Analysis</TabsTrigger>
          <TabsTrigger value="turnover">Inventory Turnover</TabsTrigger>
          <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
          <TabsTrigger value="profit">Profit Margins</TabsTrigger>
          <TabsTrigger value="deadstock">Dead Stock</TabsTrigger>
        </TabsList>

        {/* ABC Analysis */}
        <TabsContent value="abc" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Target className="h-5 w-5" />
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

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>ABC Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Category A</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-600 text-white">High Value</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'A').length} items contributing to ~80% of revenue
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Category B</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white">Medium Value</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'B').length} items contributing to ~15% of revenue
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Category C</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-600 text-white">Low Value</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {abcAnalysis.filter(a => a.category === 'C').length} items contributing to ~5% of revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Detailed ABC Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold">Product</th>
                      <th className="pb-3 text-center text-sm font-semibold">Category</th>
                      <th className="pb-3 text-right text-sm font-semibold">Revenue %</th>
                      <th className="pb-3 text-left text-sm font-semibold">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abcAnalysis.slice(0, 20).map((item) => (
                      <tr key={item.itemId} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3">{item.itemName}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium">
                          {item.revenueContribution.toFixed(2)}%
                        </td>
                        <td className="py-3 text-sm text-slate-600 dark:text-slate-400">
                          {item.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Turnover */}
        <TabsContent value="turnover" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Turnover Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnoverChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">Avg Turnover Ratio</span>
                    <span className="text-lg font-bold">
                      {(turnover.reduce((sum, t) => sum + t.turnoverRatio, 0) / turnover.length || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">Fast Moving Items</span>
                    <span className="text-lg font-bold text-green-600">
                      {turnover.filter(t => t.status === 'fast-moving').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">Slow Moving Items</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {turnover.filter(t => t.status === 'slow-moving').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">Dead Stock Items</span>
                    <span className="text-lg font-bold text-red-600">
                      {turnover.filter(t => t.status === 'dead-stock').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Inventory Turnover Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold">Product</th>
                      <th className="pb-3 text-right text-sm font-semibold">Turnover Ratio</th>
                      <th className="pb-3 text-right text-sm font-semibold">Days to Sell</th>
                      <th className="pb-3 text-center text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnover.slice(0, 20).map((item) => (
                      <tr key={item.itemId} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3">{item.itemName}</td>
                        <td className="py-3 text-right font-medium">{item.turnoverRatio}</td>
                        <td className="py-3 text-right">{item.daysToSell}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Forecast */}
        <TabsContent value="forecast" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Predictive Sales Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold">Product</th>
                      <th className="pb-3 text-right text-sm font-semibold">Predicted Demand</th>
                      <th className="pb-3 text-right text-sm font-semibold">Recommended Reorder</th>
                      <th className="pb-3 text-center text-sm font-semibold">Trend</th>
                      <th className="pb-3 text-right text-sm font-semibold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.slice(0, 20).map((item) => (
                      <tr key={item.itemId} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3">{item.itemName}</td>
                        <td className="py-3 text-right font-medium">{item.predictedDemand}</td>
                        <td className="py-3 text-right font-semibold text-blue-600">{item.recommendedReorderQty}</td>
                        <td className="py-3 text-center">{getTrendIcon(item.trend)}</td>
                        <td className="py-3 text-right">{item.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Margins */}
        <TabsContent value="profit" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profit Margin by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={profitMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="margin" fill="#10B981" name="Profit Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold">Category</th>
                      <th className="pb-3 text-right text-sm font-semibold">Revenue</th>
                      <th className="pb-3 text-right text-sm font-semibold">Profit</th>
                      <th className="pb-3 text-right text-sm font-semibold">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitMargin.map((item, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3">{item.category}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(item.revenue)}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(item.profit)}</td>
                        <td className="py-3 text-right font-bold">{item.margin.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dead Stock */}
        <TabsContent value="deadstock" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Dead Stock Alert ({deadStock.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadStock.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <p className="text-lg font-medium">No dead stock found!</p>
                  <p className="text-sm">All items are moving well.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left text-sm font-semibold">Product</th>
                        <th className="pb-3 text-left text-sm font-semibold">Category</th>
                        <th className="pb-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="pb-3 text-right text-sm font-semibold">Value</th>
                        <th className="pb-3 text-left text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deadStock.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3">{item.name}</td>
                          <td className="py-3">{item.category}</td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right font-medium">{formatCurrency(item.quantity * item.costPrice)}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Consider Discount/Removal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
