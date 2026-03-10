'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, Package } from 'lucide-react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'

interface InventoryAlert {
  id: string
  productId: string
  storeId: string
  storeName: string
  currentStock: number
  threshold: number
  channel: string
  createdAt: string
  updatedAt: string
}

/**
 * Team Leader Inventory Alerts Page
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export default function InventoryAlertsPage() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const session = getTeamLeaderSession()

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const response = await fetch('/api/team-leader/inventory-alerts', {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch alerts')
      }

      setAlerts(data.alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to load inventory alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverity = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100
    if (percentage === 0) return { level: 'critical', color: 'bg-red-100 text-red-700', label: 'Out of Stock' }
    if (percentage <= 25) return { level: 'critical', color: 'bg-red-100 text-red-700', label: 'Critical' }
    if (percentage <= 50) return { level: 'warning', color: 'bg-orange-100 text-orange-700', label: 'Warning' }
    return { level: 'low', color: 'bg-yellow-100 text-yellow-700', label: 'Low' }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading inventory alerts...</p>
        </div>
      </div>
    )
  }

  const criticalAlerts = alerts.filter(a => getSeverity(a.currentStock, a.threshold).level === 'critical')
  const warningAlerts = alerts.filter(a => getSeverity(a.currentStock, a.threshold).level === 'warning')
  const lowAlerts = alerts.filter(a => getSeverity(a.currentStock, a.threshold).level === 'low')

  return (
    <div className="space-y-5 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Inventory Alerts</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Low stock items for {session?.assignedChannel}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAlerts}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              {criticalAlerts.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Critical</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {warningAlerts.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Warning</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {lowAlerts.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Low Stock</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 border-l-4 border-l-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => {
                const severity = getSeverity(alert.currentStock, alert.threshold)
                return (
                  <Alert key={alert.id} className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-red-900 dark:text-red-200">
                          Product ID: {alert.productId}
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-300">
                          Store: {alert.storeName} • Current: {alert.currentStock} / Threshold: {alert.threshold}
                        </p>
                      </div>
                      <Badge className={`${severity.color} border-0`}>
                        {severity.label}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 border-l-4 border-l-orange-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Warning Alerts ({warningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warningAlerts.map((alert) => {
                const severity = getSeverity(alert.currentStock, alert.threshold)
                return (
                  <Alert key={alert.id} className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-orange-900 dark:text-orange-200">
                          Product ID: {alert.productId}
                        </p>
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          Store: {alert.storeName} • Current: {alert.currentStock} / Threshold: {alert.threshold}
                        </p>
                      </div>
                      <Badge className={`${severity.color} border-0`}>
                        {severity.label}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {lowAlerts.length > 0 && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 border-l-4 border-l-yellow-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-yellow-600" />
              Low Stock Alerts ({lowAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowAlerts.map((alert) => {
                const severity = getSeverity(alert.currentStock, alert.threshold)
                return (
                  <Alert key={alert.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <AlertDescription className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900 dark:text-yellow-200">
                          Product ID: {alert.productId}
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Store: {alert.storeName} • Current: {alert.currentStock} / Threshold: {alert.threshold}
                        </p>
                      </div>
                      <Badge className={`${severity.color} border-0`}>
                        {severity.label}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">All inventory levels are healthy</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">No low stock alerts at this time</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
