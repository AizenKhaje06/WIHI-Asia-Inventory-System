'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, ShoppingCart, Percent, Package, RefreshCw } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'
import Link from 'next/link'

interface KPIs {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  itemsSold: number
  totalOrders: number
  channel: string
}

/**
 * Team Leader Dashboard
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export default function TeamLeaderDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const session = getTeamLeaderSession()

  const fetchKPIs = async () => {
    try {
      setRefreshing(true)
      const headers = getAuthHeaders()
      
      const response = await fetch('/api/team-leader/dashboard/kpis/realtime', {
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

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(fetchKPIs, 5000)

    return () => clearInterval(interval)
  }, [])

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
            <Link href="/team-leader-login">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Welcome back! Channel: <span className="font-semibold">{session.assignedChannel}</span>
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

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Total Revenue */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={kpis?.totalRevenue || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Revenue</div>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱<AnimatedNumber value={kpis?.totalProfit || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Profit</div>
          </CardContent>
        </Card>

        {/* Items Sold */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              <AnimatedNumber value={kpis?.itemsSold || 0} duration={1500} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Items Sold</div>
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
              <AnimatedNumber value={kpis?.profitMargin || 0} decimals={1} duration={1500} />%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Profit Margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedNumber value={kpis?.totalOrders || 0} duration={1000} />
                </div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">Total Orders</div>
              </div>
              <Package className="h-8 w-8 text-blue-400 dark:text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-slate-600 dark:text-slate-400">
                  ₱<AnimatedNumber value={kpis?.totalCost || 0} duration={1000} />
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">Total COGS</div>
              </div>
              <Package className="h-8 w-8 text-slate-400 dark:text-slate-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/team-leader/track-orders">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Track Orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/team-leader/packing-queue">
                <Package className="h-3 w-3 mr-1" />
                Packing Queue
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/team-leader/dispatch">
                <TrendingUp className="h-3 w-3 mr-1" />
                Dispatch
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 text-xs" asChild>
              <Link href="/team-leader/inventory-alerts">
                <Package className="h-3 w-3 mr-1" />
                Alerts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
