'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { RefreshCw, Package, CheckCircle } from 'lucide-react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: string
  orderDate: string
  channel: string
  store: string
}

/**
 * Team Leader Packing Queue Page
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function PackingQueuePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [packing, setPacking] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const session = getTeamLeaderSession()

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const response = await fetch('/api/team-leader/packing-queue', {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch packing queue')
      }

      setOrders(data.queue)
    } catch (error) {
      console.error('Error fetching queue:', error)
      toast.error('Failed to load packing queue')
    } finally {
      setLoading(false)
    }
  }

  const handlePackOrder = async (orderId: string) => {
    try {
      setPacking(orderId)
      const headers = getAuthHeaders()

      const response = await fetch(`/api/team-leader/packing-queue/${orderId}/pack`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pack order')
      }

      toast.success('Order packed successfully')
      setShowConfirm(false)
      setSelectedOrder(null)
      fetchQueue()
    } catch (error) {
      console.error('Error packing order:', error)
      toast.error('Failed to pack order')
    } finally {
      setPacking(null)
    }
  }

  useEffect(() => {
    fetchQueue()

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading packing queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Packing Queue</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Orders waiting to be packed
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchQueue}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Queue Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {orders.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Orders in Queue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {orders.reduce((sum, o) => sum + o.quantity, 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ₱{orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No orders in queue</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">All orders have been packed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {order.quantity} items
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.customerName} • {order.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        ₱{order.totalAmount.toFixed(2)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 pb-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Product:</span> {order.itemName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Store:</span> {order.store}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowConfirm(true)
                    }}
                    disabled={packing === order.id}
                  >
                    {packing === order.id ? (
                      <>
                        <BrandLoader size="sm" />
                        <span className="ml-2">Packing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Packed
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Packing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark order #{selectedOrder?.id.slice(-6)} as packed?
              This will move it to the dispatch queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && handlePackOrder(selectedOrder.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
