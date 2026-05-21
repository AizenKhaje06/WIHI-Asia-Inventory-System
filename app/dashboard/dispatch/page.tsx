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
  const isTeamLeader = false // Team leader role removed

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
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-0">
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

      {/* Dispatch Form Dialog - Professional Design */}
      <Dialog open={showDispatchForm} onOpenChange={setShowDispatchForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
          {/* Modal Header with Gradient */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6 border-b border-slate-600">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight" style={{ color: 'white' }}>
                    Order Dispatch Form
                  </DialogTitle>
                  <p className="text-slate-200 text-sm mt-1 font-medium">
                    Fill in courier and tracking details for this dispatch
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Content with Scrollable Area */}
          <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-8 py-6">
            <div className="space-y-6">
              {/* Order Information Card - Emerald/Teal Gradient */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Order Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Order Number
                    </p>
                    <p className="text-base font-mono font-bold text-slate-900 dark:text-white">
                      #{(selectedOrder?.orderNumber || selectedOrder?.id || '').slice(-6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Customer Name
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedOrder?.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Quantity
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedOrder?.qty || selectedOrder?.quantity || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatCurrency(selectedOrder?.total || selectedOrder?.totalAmount || 0)}
                    </p>
                  </div>
                  {selectedOrder?.sales_channel && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Sales Channel
                      </p>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-sm font-semibold px-3 py-1.5">
                        {selectedOrder.sales_channel || selectedOrder.channel}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Dispatch Details Card - Purple/Pink Gradient */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Dispatch Details
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {/* Courier Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      Courier Service <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={dispatchForm.courier} 
                      onValueChange={(value) => setDispatchForm({ ...dispatchForm, courier: value })}
                    >
                      <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium">
                        <SelectValue placeholder="Select courier service" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="J&T Express">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-purple-600" />
                            <span>J&T Express</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="LBC">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-red-600" />
                            <span>LBC</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Ninja Van">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-orange-600" />
                            <span>Ninja Van</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Flash Express">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-yellow-600" />
                            <span>Flash Express</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Grab Express">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span>Grab Express</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Lalamove">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span>Lalamove</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Other">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-slate-600" />
                            <span>Other</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tracking Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      Waybill / Tracking Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter tracking number (e.g., JT1234567890)"
                      value={dispatchForm.trackingNumber}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })}
                      className="h-12 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-400 font-medium"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Enter the complete waybill or tracking number from the courier
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - Professional Design */}
          <div className="px-8 py-5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDispatchForm(false)
                setSelectedOrder(null)
                setDispatchForm({ courier: '', trackingNumber: '' })
              }}
              className="h-11 px-6 font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={dispatching !== null || !dispatchForm.courier || !dispatchForm.trackingNumber}
              className="h-11 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
