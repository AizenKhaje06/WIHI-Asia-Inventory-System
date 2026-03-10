'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { RefreshCw, Truck, Send } from 'lucide-react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: string
  parcelStatus: string
  courier: string
  trackingNumber: string
  packedAt: string
  channel: string
  store: string
}

/**
 * Team Leader Warehouse Dispatch Page
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [dispatchForm, setDispatchForm] = useState({ courier: '', trackingNumber: '' })
  const session = getTeamLeaderSession()

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const response = await fetch('/api/team-leader/dispatch', {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dispatch queue')
      }

      setOrders(data.queue)
    } catch (error) {
      console.error('Error fetching queue:', error)
      toast.error('Failed to load dispatch queue')
    } finally {
      setLoading(false)
    }
  }

  const handleDispatch = async () => {
    if (!selectedOrder) return

    if (!dispatchForm.courier.trim()) {
      toast.error('Please enter courier name')
      return
    }

    if (!dispatchForm.trackingNumber.trim()) {
      toast.error('Please enter tracking number')
      return
    }

    try {
      setDispatching(selectedOrder.id)
      const headers = getAuthHeaders()

      const response = await fetch(`/api/team-leader/dispatch/${selectedOrder.id}/dispatch`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courier: dispatchForm.courier,
          trackingNumber: dispatchForm.trackingNumber
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch order')
      }

      toast.success('Order dispatched successfully')
      setShowDispatchForm(false)
      setSelectedOrder(null)
      setDispatchForm({ courier: '', trackingNumber: '' })
      fetchQueue()
    } catch (error) {
      console.error('Error dispatching order:', error)
      toast.error('Failed to dispatch order')
    } finally {
      setDispatching(null)
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
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading dispatch queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Warehouse Dispatch</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Manage packed orders ready for shipment
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
            <div className="text-xs text-slate-600 dark:text-slate-400">Ready for Dispatch</div>
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
            Packed Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No orders ready for dispatch</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">All packed orders have been dispatched</p>
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
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Packed
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
                        {new Date(order.packedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 pb-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Product:</span> {order.itemName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Qty:</span> {order.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Address:</span> {order.customerAddress}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    onClick={() => {
                      setSelectedOrder(order)
                      setDispatchForm({ courier: order.courier || '', trackingNumber: order.trackingNumber || '' })
                      setShowDispatchForm(true)
                    }}
                    disabled={dispatching === order.id}
                  >
                    {dispatching === order.id ? (
                      <>
                        <BrandLoader size="sm" />
                        <span className="ml-2">Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Dispatch Order
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispatch Form Dialog */}
      <Dialog open={showDispatchForm} onOpenChange={setShowDispatchForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Order #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">Courier</label>
              <Input
                placeholder="e.g., J&T, LBC, Grab"
                value={dispatchForm.courier}
                onChange={(e) => setDispatchForm({ ...dispatchForm, courier: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white">Tracking Number</label>
              <Input
                placeholder="Enter tracking/waybill number"
                value={dispatchForm.trackingNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })}
                className="mt-1"
              />
            </div>

            {selectedOrder && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Customer:</span> {selectedOrder.customerName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Items:</span> {selectedOrder.quantity}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Amount:</span> ₱{selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispatchForm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={handleDispatch}
              disabled={dispatching !== null}
            >
              {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
