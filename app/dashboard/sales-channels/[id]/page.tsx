"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Calendar,
  Percent
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface DepartmentDetail {
  name: string
  metrics: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    transactionCount: number
    totalQuantity: number
    profitMargin: number
  }
  cashFlow: Array<{
    date: string
    revenue: number
    cost: number
    profit: number
  }>
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    itemName: string
    quantity: number
    revenue: number
    cost: number
    profit: number
    timestamp: string
    staffName?: string
    notes?: string
  }>
}

export default function SalesChannelDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const departmentName = decodeURIComponent(params.id as string)
  const [data, setData] = useState<DepartmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || "")
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || "")

  useEffect(() => {
    if (!startDate || !endDate) {
      // Set default date range (last 30 days)
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(end.toISOString().split('T')[0])
    }
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchData()
    }
  }, [startDate, endDate, departmentName])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await fetch(`/api/departments/${encodeURIComponent(departmentName)}?${params}`)
      const result = await res.json()
      setData(result.department)
    } catch (error) {
      console.error("Error fetching department details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading channel details...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Channel not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isPositive = data.metrics.totalProfit >= 0

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales Channels
        </Button>
        
        <h1 className="text-4xl font-bold gradient-text mb-2">
          {data.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Detailed performance analytics and cash flow
        </p>
      </div>

      {/* Date Filter */}
      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchData} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(data.metrics.totalRevenue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-red-100 dark:bg-red-900/30">
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(data.metrics.totalCost)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Cost</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-[5px] ${isPositive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <DollarSign className={`h-4 w-4 ${isPositive ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${isPositive ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(data.metrics.totalProfit)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Profit</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {data.metrics.profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Margin</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(data.metrics.transactionCount)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Transactions</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(data.metrics.totalQuantity)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Items Sold</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            Cash Flow Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.cashFlow}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="date" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={3} name="Cost" />
              <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={3} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                <XAxis 
                  type="number"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {transaction.itemName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(transaction.revenue)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Qty: {transaction.quantity}
                      </span>
                      {transaction.staffName && (
                        <span className="text-slate-600 dark:text-slate-400">
                          Staff: {transaction.staffName}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No transactions found
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
