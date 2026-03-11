'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, TrendingUp, ShoppingCart, Percent, Package, RefreshCw, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, PackageX, PackageOpen,
  AlertCircle, Activity, RotateCcw, FileText
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { AnimatedNumber } from '@/components/ui/animated-number'
import { BrandLoader } from '@/components/ui/brand-loader'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { GaugeChart } from '@/components/charts/gauge-chart'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import type { TimePeriod } from '@/components/dashboard/revenue-chart'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'
import { formatNumber, cn } from '@/lib/utils'
import { formatChartData, calculatePeriodComparison } from '@/lib/dashboard-utils'
import Link from 'next/link'

interface KPIs {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  itemsSold: number
  totalOrders: number
  channel: string
  revenueToday?: number
  itemsSoldToday?: number
  recentSales?: number
  returnValue?: number
  returnRate?: number
  damagedReturnRate?: number
  supplierReturnRate?: number
  totalItems?: number
  totalValue?: number
}

export default function TeamLeaderDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("ID")
  const session = getTeamLeaderSession()

  const fetchKPIs = async () => {
    try {
      setRefreshing(true)
      const headers = getAuthHeaders()
      
      const response = await fetch(`/api/team-leader/dashboard/kpis/realtime?period=${timePeriod}`, {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch KPIs')
      }

      setKpis(data.kpis)
    } catch (error) {
      console.error('Error fetching KPIs:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchKPIs()
  }, [timePeriod])

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

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Session expired. Please log in again.</p>
          <Button asChild className="mt-4">
            <Link href="/">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  const netProfit = (kpis?.totalProfit || 0) - (kpis?.returnValue || 0)

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Channel: <span className="font-semibold text-orange-600 dark:text-orange-400">{session.assignedChannel}</span> • All data filtered for your channel only
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchKPIs}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Enhanced Metric Cards - 7 KPIs */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        {/* Total Revenue */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              ₱<AnimatedNumber value={kpis?.totalRevenue || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Total Revenue</div>
            {kpis?.revenueToday !== undefined && kpis.revenueToday > 0 && (
              <div className="flex items-center gap-0.5">
                <ArrowUpRight className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ₱{formatNumber(kpis.revenueToday)} today
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              ₱<AnimatedNumber value={netProfit} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Net Profit</div>
            {kpis?.returnValue !== undefined && kpis.returnValue > 0 && (
              <div className="flex items-center gap-0.5">
                <ArrowDownRight className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  ₱{formatNumber(kpis.returnValue)} returns
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sold */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              <AnimatedNumber value={kpis?.itemsSold || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Total Sold</div>
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                All-time quantity sold
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Items Sold Today */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-orange-100 dark:bg-orange-900/30">
                <ShoppingCart className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              <AnimatedNumber value={kpis?.itemsSoldToday || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Items Sold Today</div>
            {kpis?.itemsSoldToday !== undefined && kpis.itemsSoldToday > 0 && (
              <div className="flex items-center gap-0.5">
                <Package className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {kpis.recentSales} transactions
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              <AnimatedNumber value={kpis?.profitMargin || 0} decimals={1} duration={1500} />%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Profit Margin</div>
            {kpis?.profitMargin !== undefined && (
              <div className="flex items-center gap-0.5">
                <span className={cn(
                  "text-xs font-medium",
                  (kpis.profitMargin || 0) >= 30 ? "text-green-600 dark:text-green-400" :
                  (kpis.profitMargin || 0) >= 15 ? "text-amber-600 dark:text-amber-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {(kpis.profitMargin || 0) >= 30 ? "Excellent" :
                   (kpis.profitMargin || 0) >= 15 ? "Good" : "Needs improvement"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              ₱<AnimatedNumber value={kpis?.totalValue || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Inventory Value</div>
            {kpis?.totalItems !== undefined && (
              <div className="flex items-center gap-0.5">
                <Package className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {kpis.totalItems} items in stock
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Rate */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1.5 rounded-[4px] bg-orange-100 dark:bg-orange-900/30">
                <RotateCcw className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">
              <AnimatedNumber value={kpis?.returnRate || 0} decimals={1} duration={1500} />%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Return Rate</div>
            {kpis?.returnRate !== undefined && kpis.returnRate > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Monitor returns
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-125">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedNumber value={kpis?.totalOrders || 0} duration={1000} />
                </div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-0.5">Total Orders</div>
              </div>
              <Package className="h-8 w-8 text-blue-400 dark:text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  ₱<AnimatedNumber value={kpis?.totalCost || 0} duration={1000} />
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Total COGS</div>
              </div>
              <Package className="h-8 w-8 text-slate-400 dark:text-slate-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/dashboard/pos">
                <ShoppingCart className="h-3 w-3 mr-1.5" />
                Warehouse Dispatch
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/dashboard/packing-queue">
                <Package className="h-3 w-3 mr-1.5" />
                Packing Queue
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/dashboard/track-orders">
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Track Orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/dashboard/inventory">
                <Package className="h-3 w-3 mr-1.5" />
                Inventory
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Channel Info Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-xs text-orange-700 dark:text-orange-300">
          <span className="font-semibold">Channel-Specific Data:</span> All metrics and data shown are filtered exclusively for <span className="font-bold">{session.assignedChannel}</span>. No data from other sales channels is included.
        </AlertDescription>
      </Alert>
    </div>
  )
}
