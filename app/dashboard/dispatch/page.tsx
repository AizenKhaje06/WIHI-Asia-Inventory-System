'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { RefreshCw, Truck, Send, Search, Package } from 'lucide-react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { apiGet } from '@/lib/api-client'
import { getCurrentUserRole, getAuthHeaders } from '@/lib/role-utils'

interface Order {
  id: string
  orderNumber?: string
  customerName: string
  customerPhone: string
  customerAddress: string
  itemName?: string
  product?: string
  quantity?: number
  qty?: number
  totalAmount?: number
  total?: number
  orderStatus?: string
  status?: string
  parcelStatus?: string
  parcel_status?: string
  courier?: string
  trackingNumber?: string
  waybill?: string
  packedAt?: string
  packed_at?: string
  channel?: string
  sales_channel?: string
  store?: string
  date?: string
  orderDate?: string
}

/**
 * Shared Warehouse Dispatch Page
 * Works for both Admin and Team Leader roles
 */
export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [dispatchForm, setDispatchForm] = useState({ courier: '', trackingNumber: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>('all')

  // Role detection
  const userRole = getCurrentUserRole()
  const isTeamLeader = userRole === 'team_leader'

  useEffect(() => {
    fetchQueue()

    // Poll for updates every 10 seconds (team leaders only)
    if (isTeamLeader) {
      const interval = setInterval(fetchQueue, 10000)
      return () => clearInterval(interval)
    }
  }, [isTeamLeader])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, salesChannelFilter, orders])

  const fetchQueue = async () => {
    try {
      setLoading(true)

      // Team leaders use their own API endpoint
      if (isTeamLeader) {
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

        setOrders(data.queue || [])
        setFilteredOrders(data.queue || [])
        setLoading(false)
        return
      }

      // Admin: Fetch packed orders ready for dispatch
      const data = await apiGet<any[]>('/api/orders?status=Packed')
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error('Error fetching queue:', error)
      toast.error('Failed to load dispatch queue')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.store || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.waybill || order.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (salesChannelFilter !== 'all') {
      filtered = filtered.filter(order => 
        (order.sales_channel || order.channel) === salesChannelFilter
      )
    }
    
    setFilteredOrders(filtered)
  }

  const openDispatchForm = (order: Order) => {
    setSelectedOrder(order)
    setDispatchForm({
      courier: order.courier || '',
      trackingNumber: order.trackingNumber || order.waybill || ''
    })
    setShowDispatchForm(true)
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

      // Team leaders use their own API endpoint
      if (isTeamLeader) {
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
        return
      }

      // Admin: Update order with courier and tracking info
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcel_status: 'IN TRANSIT',
          courier: dispatchForm.courier,
          waybill: dispatchForm.trackingNumber
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to dispatch order')
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading dispatch queue...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Warehouse Dispatch</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isTeamLeader 
              ? 'Dispatch packed orders for your channel'
              : 'Dispatch packed orders to customers'
            }
          </p>
        </div>
        <Button onClick={fetchQueue} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Ready to Dispatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrders.reduce((sum, order) => sum + (order.qty || order.quantity || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {!isTeamLeader && (
              <Select value={salesChannelFilter} onValueChange={setSalesChannelFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="Shopee">Shopee</SelectItem>
                  <SelectItem value="Lazada">Lazada</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Physical Store">Physical Store</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No orders ready for dispatch</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Packed orders will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Order #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Date
                    </th>
                    {!isTeamLeader && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Channel
                      </th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Qty
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 text-sm">
                        <span className="font-mono text-slate-900 dark:text-white">
                          #{(order.orderNumber || order.id).slice(-6)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.date || order.orderDate || '').toLocaleDateString()}
                      </td>
                      {!isTeamLeader && (
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">
                            {order.sales_channel || order.channel || 'N/A'}
                          </Badge>
                        </td>
                      )}
                      <td className="py-3 px-4 text-sm">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                        {order.product || order.itemName}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {order.qty || order.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(order.total || order.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {order.parcel_status || order.parcelStatus || 'Packed'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => openDispatchForm(order)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Dispatch
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispatch Form Dialog */}
      <Dialog open={showDispatchForm} onOpenChange={setShowDispatchForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order #</label>
              <div className="font-mono text-sm text-slate-600 dark:text-slate-400">
                #{(selectedOrder?.orderNumber || selectedOrder?.id || '').slice(-6)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedOrder?.customerName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier *</label>
              <Input
                placeholder="Enter courier name (e.g., J&T, LBC, Ninja Van)"
                value={dispatchForm.courier}
                onChange={(e) => setDispatchForm({ ...dispatchForm, courier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number *</label>
              <Input
                placeholder="Enter tracking/waybill number"
                value={dispatchForm.trackingNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDispatchForm(false)
                setSelectedOrder(null)
                setDispatchForm({ courier: '', trackingNumber: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={dispatching !== null}
            >
              {dispatching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Dispatch Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
