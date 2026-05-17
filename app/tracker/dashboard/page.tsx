'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, 
  User, Phone, MapPin, AlertCircle, PackageCheck, AlertTriangle, RotateCcw
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { apiGet } from '@/lib/api-client'
import { BrandLoader } from '@/components/ui/brand-loader'
import { EnterpriseDateRangePicker } from '@/components/ui/enterprise-date-range-picker'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  storeName?: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: 'Pending' | 'Packed'
  parcelStatus: 'PENDING' | 'DELIVERED' | 'ON DELIVERY' | 'PICKUP' | 'IN TRANSIT' | 'CANCELLED' | 'DETAINED' | 'PROBLEMATIC' | 'RETURNED'
  paymentStatus: 'pending' | 'paid' | 'cod' | 'refunded'
  courier?: string
  trackingNumber?: string
  orderDate: string
  notes?: string
  dispatchNotes?: string
  department?: string
  reason?: string // Reason for CANCELLED, RETURNED, PROBLEMATIC
}

export default function TrackerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [salesChannelFilter, setChannelFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, salesChannelFilter, startDate, endDate, orders])

  const fetchOrders = async () => {
    try {
      // Fetch only packed orders (ready for tracking)
      const data = await apiGet<any[]>('/api/orders?status=Packed')
      
      // Transform data to match Order interface
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        orderNumber: order.id,
        customerName: order.customer_name || 'N/A',
        customerPhone: order.customer_contact || 'N/A',
        customerAddress: order.customer_address || 'N/A',
        storeName: order.store || 'N/A',
        itemName: order.product || 'N/A',
        quantity: order.qty || 0,
        totalAmount: order.total || 0,
        orderStatus: order.status as 'Pending' | 'Packed',
        parcelStatus: (order.parcel_status || 'PENDING') as any,
        paymentStatus: (order.payment_status || 'pending') as any,
        courier: order.courier || '-',
        trackingNumber: order.waybill || '-',
        orderDate: order.packed_at || order.date,
        notes: JSON.stringify({
          dispatchedBy: order.dispatched_by,
          dispatchedAt: order.created_at,
          packedBy: order.packed_by,
          packedAt: order.packed_at,
          store: order.store
        }),
        dispatchNotes: order.dispatch_notes || '',
        department: order.sales_channel || 'N/A',
        reason: order.reason || ''
      }))
      
      setOrders(transformedOrders)
      setFilteredOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, parcelStatus: string, reason?: string) => {
    try {
      // Optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, parcelStatus: parcelStatus as any, reason: reason || '' }
            : order
        )
      )
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, parcelStatus: parcelStatus as any, reason: reason || '' }
            : order
        )
      )

      // Update in background
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcel_status: parcelStatus,
          reason: reason || null
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchOrders()
        throw new Error('Failed to update status')
      }

      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.parcelStatus === statusFilter)
    }
    
    if (salesChannelFilter !== 'all') {
      filtered = filtered.filter(order => order.department === salesChannelFilter)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter(order => new Date(order.orderDate) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter(order => new Date(order.orderDate) <= end)
    }
    
    setFilteredOrders(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setChannelFilter('all')
    setStartDate(null)
    setEndDate(null)
    toast.success('Filters cleared')
  }

  const getParcelStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'ON DELIVERY': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PICKUP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'IN TRANSIT': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      DETAINED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      PROBLEMATIC: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      RETURNED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    }
    
    const icons = {
      PENDING: Clock,
      DELIVERED: CheckCircle,
      'ON DELIVERY': Truck,
      PICKUP: Package,
      'IN TRANSIT': Truck,
      CANCELLED: XCircle,
      DETAINED: AlertCircle,
      PROBLEMATIC: AlertTriangle,
      RETURNED: RotateCcw,
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    const style = styles[status as keyof typeof styles] || styles.PENDING
    
    return (
      <Badge className={`${style} border-0 text-[10px] px-1.5 py-0.5`}>
        <Icon className="h-2.5 w-2.5 mr-1" />
        {status}
      </Badge>
    )
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const totalOrders = filteredOrders.length

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Tracker Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Update parcel status and manage order tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EnterpriseDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start)
              setEndDate(end)
            }}
            className="h-11 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg font-semibold transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order # or tracking #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Sales Channel Filter */}
            <Select value={salesChannelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="sm:w-48 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-0">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="Shopee">Shopee</SelectItem>
                <SelectItem value="Lazada">Lazada</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Physical Store">Physical Store</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-48 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-0">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN TRANSIT">In Transit</SelectItem>
                <SelectItem value="ON DELIVERY">On Delivery</SelectItem>
                <SelectItem value="PICKUP">Pickup</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DETAINED">Detained</SelectItem>
                <SelectItem value="PROBLEMATIC">Problematic</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || salesChannelFilter !== 'all' || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 border-b border-slate-700">
          <CardTitle className="text-white text-lg font-semibold">
            Orders ({totalOrders})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[8%]">Date</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[10%]">Name</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[20%]">Address</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[10%]">Contact No.</th>
                  <th className="text-right p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[8%]">Price</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[18%]">Items</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[12%]">Tracking</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[14%]">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-[20%]">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => openDetailsModal(order)}
                    >
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(order.orderDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                      </td>
                      <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">
                        {order.customerName}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                        {order.customerAddress}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                        {order.customerPhone}
                      </td>
                      <td className="p-3 text-sm font-semibold text-right text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                        {order.itemName}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300 font-mono">
                        {order.trackingNumber}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Select 
                          value={order.parcelStatus} 
                          onValueChange={(value) => {
                            // If status requires reason, show modal
                            if (['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(value)) {
                              setSelectedOrder(order)
                              setShowDetailsModal(true)
                            } else {
                              updateOrderStatus(order.id, value)
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN TRANSIT">In Transit</SelectItem>
                            <SelectItem value="ON DELIVERY">On Delivery</SelectItem>
                            <SelectItem value="PICKUP">Pickup</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="DETAINED">Detained</SelectItem>
                            <SelectItem value="PROBLEMATIC">Problematic</SelectItem>
                            <SelectItem value="RETURNED">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                        {order.reason || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pr-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Order #</p>
                    <p className="font-medium text-slate-900 dark:text-white">#{selectedOrder.id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Items</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.itemName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tracking Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Courier</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.courier}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Tracking #</p>
                    <p className="font-medium text-slate-900 dark:text-white font-mono">{selectedOrder.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Parcel Status</Label>
                    <Select 
                      value={selectedOrder.parcelStatus} 
                      onValueChange={(value) => {
                        setSelectedOrder({ ...selectedOrder, parcelStatus: value as any })
                      }}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN TRANSIT">In Transit</SelectItem>
                        <SelectItem value="ON DELIVERY">On Delivery</SelectItem>
                        <SelectItem value="PICKUP">Pickup</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="DETAINED">Detained</SelectItem>
                        <SelectItem value="PROBLEMATIC">Problematic</SelectItem>
                        <SelectItem value="RETURNED">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason field - shown for CANCELLED, RETURNED, PROBLEMATIC */}
                  {['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(selectedOrder.parcelStatus) && (
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason..."
                        value={selectedOrder.reason || ''}
                        onChange={(e) => setSelectedOrder({ ...selectedOrder, reason: e.target.value })}
                        rows={3}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      updateOrderStatus(
                        selectedOrder.id, 
                        selectedOrder.parcelStatus,
                        ['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(selectedOrder.parcelStatus) 
                          ? selectedOrder.reason 
                          : undefined
                      )
                      setShowDetailsModal(false)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
