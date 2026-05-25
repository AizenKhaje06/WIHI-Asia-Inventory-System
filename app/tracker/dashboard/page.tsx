'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, 
  User, Phone, MapPin, AlertCircle, PackageCheck, AlertTriangle, RotateCcw, Eye
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

  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'cod' | 'refunded') => {
    try {
      // Optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus }
            : order
        )
      )
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus }
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
          payment_status: paymentStatus
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchOrders()
        throw new Error('Failed to update payment status')
      }

      toast.success('Payment status updated successfully')
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Failed to update payment status')
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
  const deliveredCount = filteredOrders.filter(o => o.parcelStatus === 'DELIVERED').length
  const returnedCount = filteredOrders.filter(o => o.parcelStatus === 'RETURNED').length

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
    <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">Tracker Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Update parcel status and manage order tracking
          </p>
        </div>
        <EnterpriseDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          className="h-10 sm:h-11 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg font-semibold transition-all shadow-sm"
        />
      </div>

      {/* KPI Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Orders */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Total Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {totalOrders}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">
              All tracked orders
            </p>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Delivered</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {deliveredCount}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">
              {totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}% delivery rate` : 'No orders yet'}
            </p>
          </CardContent>
        </Card>

        {/* Returned */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/10 to-red-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Returned</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {returnedCount}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium">
              {totalOrders > 0 ? `${Math.round((returnedCount / totalOrders) * 100)}% return rate` : 'No returns yet'}
            </p>
          </CardContent>
        </Card>
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
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Orders Queue
                </CardTitle>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} ready
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end flex-shrink-0">
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {statusFilter}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    Searching
                  </Badge>
                )}
                {!searchTerm && statusFilter === 'all' && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    All Orders
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {searchTerm ? 'No matching orders' : 'No orders found'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                {searchTerm ? 'Try different search' : 'All orders tracked! 🎉'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Scroll Hint */}
              <div className="md:hidden px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 font-medium">
                  <span className="text-blue-500">←</span>
                  <span>Swipe to see all columns • Tap row to highlight</span>
                  <span className="text-blue-500">→</span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '8%' }}>
                        Date
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                        Name
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '20%' }}>
                        Address
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                        Contact No.
                      </th>
                      <th className="text-right py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '8%' }}>
                        Price
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '18%' }}>
                        Items
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '12%' }}>
                        Tracking
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                        Payment
                      </th>
                      <th className="text-left py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '12%' }}>
                        Status
                      </th>
                      <th className="text-center py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider" style={{ width: '12%' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {new Date(order.orderDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: '2-digit', 
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {new Date(order.orderDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                hour12: true
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[11px] text-slate-900 dark:text-white font-medium block break-words">
                            {order.customerName}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 block break-words leading-relaxed">
                            {order.customerAddress}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[11px] font-mono text-slate-900 dark:text-white font-medium block break-words">
                            {order.customerPhone}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            ₱{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-slate-900 dark:text-white font-medium block break-words">
                              {order.itemName.replace(/\s*\(\d+\)\s*$/, '')}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Qty: {order.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 block break-all">
                              {order.trackingNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {order.courier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                          <Select 
                            value={order.paymentStatus} 
                            onValueChange={(value) => {
                              updateOrderPaymentStatus(order.id, value as any)
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="cod">COD</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                          <Select 
                            value={order.parcelStatus} 
                            onValueChange={(value) => {
                              // Update status directly without modal
                              updateOrderStatus(order.id, value)
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
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => openDetailsModal(order)}
                              className="h-8 px-3 text-[11px] font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 whitespace-nowrap rounded-lg inline-flex items-center gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal - Professional Design */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
          {/* Modal Header with Gradient */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6 border-b border-slate-600">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-white">Order Details</span>
              </DialogTitle>
              <p className="text-slate-200 text-sm mt-2 font-medium">
                View and update order tracking information
              </p>
            </DialogHeader>
          </div>

          {selectedOrder && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6">
              <div className="space-y-6">
                {/* Customer Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Customer Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Full Name
                      </p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {selectedOrder.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Phone Number
                      </p>
                      <p className="text-base font-mono font-semibold text-slate-900 dark:text-white">
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Delivery Address
                      </p>
                      <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                        {selectedOrder.customerAddress}
                      </p>
                    </div>
                    {selectedOrder.dispatchNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Dispatch Notes
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                          {selectedOrder.dispatchNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information Card */}
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
                        #{selectedOrder.id.slice(-6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Order Date
                      </p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedOrder.orderDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Product Items
                      </p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {selectedOrder.itemName.replace(/\s*\(\d+\)\s*$/, '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Quantity
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedOrder.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Sales Channel
                      </p>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-sm font-semibold px-3 py-1.5">
                        {selectedOrder.department || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Tracking Information Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Tracking Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Courier Service
                      </p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {selectedOrder.courier}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Tracking Number
                      </p>
                      <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-600 rounded-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Timeline
                    </h3>
                  </div>
                  {(() => {
                    try {
                      const notesData = JSON.parse(selectedOrder.notes || '{}')
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Dispatched */}
                          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Dispatched</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{notesData.dispatchedBy || 'N/A'}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {notesData.dispatchedAt ? new Date(notesData.dispatchedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Packed */}
                          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Packed</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{notesData.packedBy || 'N/A'}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {notesData.packedAt ? new Date(notesData.packedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    } catch (e) {
                      return (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                          No timeline information available
                        </p>
                      )
                    }
                  })()}
                </div>

                {/* Update Status Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                    Update Parcel Status
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="status" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                        Parcel Status
                      </Label>
                      <Select 
                        value={selectedOrder.parcelStatus} 
                        onValueChange={(value) => {
                          setSelectedOrder({ ...selectedOrder, parcelStatus: value as any })
                        }}
                      >
                        <SelectTrigger id="status" className="h-12 text-base font-medium border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING" className="text-base">📦 Pending</SelectItem>
                          <SelectItem value="IN TRANSIT" className="text-base">🚚 In Transit</SelectItem>
                          <SelectItem value="ON DELIVERY" className="text-base">🚛 On Delivery</SelectItem>
                          <SelectItem value="PICKUP" className="text-base">📍 Pickup</SelectItem>
                          <SelectItem value="DELIVERED" className="text-base">✅ Delivered</SelectItem>
                          <SelectItem value="CANCELLED" className="text-base">❌ Cancelled</SelectItem>
                          <SelectItem value="DETAINED" className="text-base">⚠️ Detained</SelectItem>
                          <SelectItem value="PROBLEMATIC" className="text-base">🔴 Problematic</SelectItem>
                          <SelectItem value="RETURNED" className="text-base">↩️ Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reason field - shown for CANCELLED, RETURNED, PROBLEMATIC */}
                    {['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(selectedOrder.parcelStatus) && (
                      <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                        <Label htmlFor="reason" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                          Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Please provide a detailed reason for this status..."
                          value={selectedOrder.reason || ''}
                          onChange={(e) => setSelectedOrder({ ...selectedOrder, reason: e.target.value })}
                          rows={4}
                          className="text-base border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          This information will be recorded for tracking purposes
                        </p>
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
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
