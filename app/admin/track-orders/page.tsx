'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, 
  User, Phone, Mail, MapPin, Calendar, DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'cod' | 'refunded'
  courier?: string
  trackingNumber?: string
  orderDate: string
  estimatedDelivery?: string
  deliveryDate?: string
  notes?: string
}

export default function TrackOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, paymentFilter, orders])

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockOrders: Order[] = []
      setOrders(mockOrders)
      setFilteredOrders(mockOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        order.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter)
    }
    
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter)
    }
    
    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    const style = styles[status as keyof typeof styles] || styles.pending
    
    return (
      <Badge className={`${style} border-0 text-xs px-2 py-1`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cod: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    }
    
    const style = styles[status as keyof typeof styles] || styles.pending
    
    return (
      <Badge variant="outline" className={`${style} text-xs px-2 py-0.5`}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const totalOrders = filteredOrders.length
  const pendingOrders = filteredOrders.filter(o => o.orderStatus === 'pending').length
  const shippedToday = filteredOrders.filter(o => o.orderStatus === 'shipped').length
  const deliveredToday = filteredOrders.filter(o => o.orderStatus === 'delivered').length

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Track Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage customer orders and delivery tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Total
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalOrders}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Orders</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                Pending
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {pendingOrders}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Awaiting Processing</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                Shipped
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {shippedToday}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">In Transit</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Delivered
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {deliveredToday}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Successfully Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by order, customer, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">No orders found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Orders will appear here when customers place orders
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Order #</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Item</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{order.customerName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{order.itemName}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-white">{order.quantity}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(order.orderStatus)}</td>
                      <td className="py-3 px-4 text-center">{getPaymentBadge(order.paymentStatus)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(order)}
                          className="h-8 text-xs"
                        >
                          View Details
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

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(selectedOrder.orderDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(selectedOrder.orderStatus)}
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Item</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {selectedOrder.itemName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Quantity</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {selectedOrder.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total Amount</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Name</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Phone</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                      <Phone className="h-3 w-3 mr-1.5 text-slate-400" />
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Email</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <Mail className="h-3 w-3 mr-1.5 text-slate-400" />
                        {selectedOrder.customerEmail}
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 col-span-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Delivery Address</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-start">
                      <MapPin className="h-3 w-3 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      {selectedOrder.customerAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {(selectedOrder.courier || selectedOrder.trackingNumber) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.courier && (
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Courier</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {selectedOrder.courier}
                        </p>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Tracking Number</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
