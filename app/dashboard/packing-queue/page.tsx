'use client'

import { useState, useEffect } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Package, RefreshCw, CheckCircle, ShoppingCart, TrendingUp, Eye, User, Phone, MapPin, Clock, Truck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api-client'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserRole, getAuthHeaders } from '@/lib/role-utils'

interface Order {
  id: string
  orderNumber?: string
  date: string
  sales_channel?: string
  channel?: string
  store: string
  courier: string
  waybill: string
  status: string
  orderStatus?: string
  qty: number
  quantity?: number
  cogs?: number
  total: number
  totalAmount?: number
  parcel_status?: string
  product?: string
  itemName?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  dispatchNotes?: string
  dispatched_by?: string
  packed_by: string | null
  packed_at: string | null
  created_at?: string
  orderDate?: string
}

/**
 * Shared Packing Queue Page
 * Works for both Admin and Team Leader roles
 */
export default function PackingQueuePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [packing, setPacking] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    courier: '',
    waybill: '',
    totalAmount: 0,
    dispatchNotes: ''
  })

  // Role detection
  const userRole = getCurrentUserRole()
  const isTeamLeader = false // Team leader role removed

  // Helper function to format date and time - using same logic as Activity Logs
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    // If the date string doesn't have timezone info, treat it as Philippine time
    // Supabase stores timestamps without timezone, so we need to append +08:00
    let date: Date
    if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z')) {
      // ISO format without timezone: add Philippine timezone
      date = new Date(dateString + '+08:00')
    } else if (!dateString.includes('T')) {
      // Format: "YYYY-MM-DD HH:mm:ss" - treat as Philippine time
      date = new Date(dateString.replace(' ', 'T') + '+08:00')
    } else {
      date = new Date(dateString)
    }
    
    // Format date as MM/DD/YY
    const dateStr = date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit'
    })
    
    // Format time as HH:mm (24-hour)
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    })
    
    return `${dateStr} ${timeStr}`
  }

  // Helper function to parse date as Philippine time
  const parseAsPhilippineTime = (dateString: string): Date => {
    if (!dateString) return new Date()
    
    // If the date string doesn't have timezone info, treat it as Philippine time
    if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z')) {
      // ISO format without timezone: add Philippine timezone
      return new Date(dateString + '+08:00')
    } else if (!dateString.includes('T')) {
      // Format: "YYYY-MM-DD HH:mm:ss" - treat as Philippine time
      return new Date(dateString.replace(' ', 'T') + '+08:00')
    }
    return new Date(dateString)
  }

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchOrders()

    // Poll for updates every 10 seconds (team leaders only)
    if (isTeamLeader) {
      const interval = setInterval(fetchOrders, 10000)
      return () => clearInterval(interval)
    }
  }, [isTeamLeader])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, salesChannelFilter, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      // Team leaders use their own API endpoint
      if (isTeamLeader) {
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

        setOrders(data.queue || [])
        setFilteredOrders(data.queue || [])
        setLoading(false)
        return
      }

      // Admin: Fetch only pending orders (not yet packed)
      const data = await apiGet<any[]>('/api/orders?status=Pending')
      
      // Map database fields to Order interface
      const mappedOrders: Order[] = data.map(order => ({
        id: order.id,
        orderNumber: order.id,
        date: order.date,
        sales_channel: order.sales_channel,
        channel: order.sales_channel,
        store: order.store,
        courier: order.courier,
        waybill: order.waybill,
        status: order.status,
        orderStatus: order.status,
        qty: order.qty,
        quantity: order.qty,
        cogs: order.cogs,
        total: order.total,
        totalAmount: order.total,
        parcel_status: order.parcel_status,
        product: order.product,
        itemName: order.product,
        customerName: order.customer_name,
        customerPhone: order.customer_contact,
        customerAddress: order.customer_address,
        dispatchNotes: order.dispatch_notes,
        dispatched_by: order.dispatched_by,
        packed_by: order.packed_by,
        packed_at: order.packed_at,
        created_at: order.created_at,
        orderDate: order.created_at
      } as any))
      
      setOrders(mappedOrders)
      setFilteredOrders(mappedOrders)
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
        (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.store || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.waybill || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.product || order.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (salesChannelFilter !== 'all') {
      filtered = filtered.filter(order => 
        (order.sales_channel || order.channel) === salesChannelFilter
      )
    }
    
    setFilteredOrders(filtered)
  }

  const handleMarkAsPacked = async (orderId: string) => {
    if (!currentUser) {
      toast.error('User not logged in')
      return
    }

    try {
      setPacking(orderId)

      // Team leaders use their own API endpoint
      if (isTeamLeader) {
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
        fetchOrders()
        return
      }

      // Admin: Use regular API
      const packedBy = currentUser.displayName || currentUser.username || 'Unknown User'
      await apiPost(`/api/orders/${orderId}/pack`, { packedBy })
      
      toast.success('Order marked as packed successfully!')
      fetchOrders()
    } catch (error) {
      console.error('Error packing order:', error)
      toast.error('Failed to pack order')
    } finally {
      setPacking(null)
    }
  }

  const openConfirmDialog = (order: Order) => {
    setSelectedOrder(order)
    setShowConfirm(true)
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setEditForm({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      courier: order.courier || '',
      waybill: order.waybill || '',
      totalAmount: order.total || order.totalAmount || 0,
      dispatchNotes: order.dispatchNotes || ''
    })
    setIsEditMode(false)
    setShowDetailsModal(true)
  }

  const handleEditMode = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    if (selectedOrder) {
      setEditForm({
        customerName: selectedOrder.customerName || '',
        customerPhone: selectedOrder.customerPhone || '',
        customerAddress: selectedOrder.customerAddress || '',
        courier: selectedOrder.courier || '',
        waybill: selectedOrder.waybill || '',
        totalAmount: selectedOrder.total || selectedOrder.totalAmount || 0,
        dispatchNotes: selectedOrder.dispatchNotes || ''
      })
    }
    setIsEditMode(false)
  }

  const handleSaveEdit = async () => {
    if (!selectedOrder) return

    try {
      const headers = getAuthHeaders()
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: editForm.customerName,
          customer_contact: editForm.customerPhone,
          customer_address: editForm.customerAddress,
          courier: editForm.courier,
          waybill: editForm.waybill,
          total: editForm.totalAmount,
          dispatch_notes: editForm.dispatchNotes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      toast.success('Order updated successfully')
      setIsEditMode(false)
      setShowDetailsModal(false)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return

    try {
      setDeleting(true)
      const headers = getAuthHeaders()
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      toast.success('Order deleted successfully')
      setShowDeleteConfirm(false)
      setShowDetailsModal(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading packing queue...
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
          <h1 className="text-3xl font-bold gradient-text">Packing Queue</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isTeamLeader 
              ? 'Orders waiting to be packed for your channel'
              : 'Orders waiting to be packed and dispatched'
            }
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Professional Corporate Design */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Total Orders - Blue Gradient */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent tabular-nums">
              {filteredOrders.length}
            </p>
          </div>
        </div>

        {/* Total Items - Purple Gradient */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Items</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent tabular-nums">
              {filteredOrders.reduce((sum, order) => sum + (order.qty || order.quantity || 0), 0)}
            </p>
          </div>
        </div>

        {/* Total Value - Green Gradient */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Value</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent tabular-nums">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0))}
            </p>
          </div>
        </div>
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
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No orders in queue</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                All orders have been packed
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
                <table className="w-full table-fixed min-w-[1200px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[140px]">
                        Waybill No.
                      </th>
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[140px]">
                        Date & Time
                      </th>
                      {!isTeamLeader && (
                        <th className="text-center py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[110px]">
                          Channel
                        </th>
                      )}
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[150px]">
                        Store
                      </th>
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[200px]">
                        Product
                      </th>
                      <th className="text-center py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[80px]">
                        Qty
                      </th>
                      <th className="text-right py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[120px]">
                        Total
                      </th>
                      <th className="text-center py-4 px-5 text-[11px] font-bold text-white uppercase tracking-wider w-[200px]">
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
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {order.waybill || order.id || 'N/A'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                            #{(order.id || '').slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {parseAsPhilippineTime(order.created_at || order.orderDate || order.date || '').toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: '2-digit', 
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {parseAsPhilippineTime(order.created_at || order.orderDate || order.date || '').toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>
                      {!isTeamLeader && (
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px] font-semibold whitespace-nowrap">
                            {order.sales_channel || order.channel || 'N/A'}
                          </Badge>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block">
                          {order.store}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-full">
                          <p className="text-xs text-slate-900 dark:text-white font-medium line-clamp-2 leading-relaxed">
                            {order.product || order.itemName}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-md">
                          {order.qty || order.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatCurrency(order.total || order.totalAmount || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsModal(order)}
                            className="h-9 px-4 text-xs font-medium border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 whitespace-nowrap rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                          </Button>
                          {currentUser?.role === 'admin' && (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(order)}
                              disabled={packing === order.id}
                              className="h-9 px-4 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap rounded-lg shadow-sm"
                            >
                              {packing === order.id ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Packing...
                                </>
                              ) : (
                                'Pack'
                              )}
                            </Button>
                          )}
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

      {/* Order Details Modal - Enterprise Grade */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4 pr-12">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Order Details</DialogTitle>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditMode ? (
                  <>
                    <Button
                      onClick={handleEditMode}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Order
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/30"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Order Header - Centered */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Order #{(selectedOrder.orderNumber || selectedOrder.id || '').slice(-8)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    {parseAsPhilippineTime(selectedOrder.created_at || selectedOrder.orderDate || selectedOrder.date || '').toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {/* Order Summary Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Item</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedOrder.product || selectedOrder.itemName}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Quantity</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedOrder.qty || selectedOrder.quantity}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">COGS</p>
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency((selectedOrder.total || selectedOrder.totalAmount || 0) * 0.6)}
                    </p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Total Amount</p>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={editForm.totalAmount}
                        onChange={(e) => setEditForm({...editForm, totalAmount: parseFloat(e.target.value) || 0})}
                        className="text-2xl font-bold text-green-600 dark:text-green-400 h-12"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedOrder.total || selectedOrder.totalAmount || 0)}
                      </p>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Store</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {selectedOrder.store}
                    </p>
                    {!isTeamLeader && (selectedOrder.sales_channel || selectedOrder.channel) && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs font-semibold px-2 py-1">
                        {selectedOrder.sales_channel || selectedOrder.channel}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Status</p>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold px-3 py-1">
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Delivery Information - Enterprise Style - Always Visible */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Delivery Information
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Courier</label>
                        <Input
                          value={editForm.courier}
                          onChange={(e) => setEditForm({...editForm, courier: e.target.value})}
                          className="mt-1"
                          placeholder="Enter courier name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Waybill Number</label>
                        <Input
                          value={editForm.waybill}
                          onChange={(e) => setEditForm({...editForm, waybill: e.target.value})}
                          className="mt-1"
                          placeholder="Enter waybill number"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Courier</p>
                        {selectedOrder.courier ? (
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedOrder.courier}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No courier assigned
                          </p>
                        )}
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Waybill Number</p>
                        {selectedOrder.waybill ? (
                          <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                            {selectedOrder.waybill}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No waybill number
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Information - Enterprise Style - Always Visible */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Customer Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </label>
                        <Input
                          value={editForm.customerName}
                          onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                          className="mt-1"
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Number
                        </label>
                        <Input
                          value={editForm.customerPhone}
                          onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                          className="mt-1"
                          placeholder="Enter contact number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Delivery Address
                        </label>
                        <textarea
                          value={editForm.customerAddress}
                          onChange={(e) => setEditForm({...editForm, customerAddress: e.target.value})}
                          rows={3}
                          className="mt-1 w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter delivery address"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</p>
                        </div>
                        {selectedOrder.customerName ? (
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedOrder.customerName}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No customer name provided
                          </p>
                        )}
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contact Number</p>
                        </div>
                        {selectedOrder.customerPhone ? (
                          <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                            {selectedOrder.customerPhone}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No contact number provided
                          </p>
                        )}
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Delivery Address</p>
                        </div>
                        {selectedOrder.customerAddress ? (
                          <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                            {selectedOrder.customerAddress}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                            No delivery address provided
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dispatch Notes Section - Always visible */}
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Dispatch Notes
                  </h4>
                </div>
                {isEditMode ? (
                  <textarea
                    value={editForm.dispatchNotes}
                    onChange={(e) => setEditForm({...editForm, dispatchNotes: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Add any special instructions or notes for this order..."
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    {selectedOrder.dispatchNotes ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedOrder.dispatchNotes}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                        No notes added for this order
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Dispatch Information */}
              {selectedOrder.dispatched_by && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
                      <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3">Timeline</p>
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Dispatched</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.dispatched_by}</p>
                          {selectedOrder.created_at && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {parseAsPhilippineTime(selectedOrder.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Packing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark order{' '}
              <span className="font-mono font-semibold">
                #{(selectedOrder?.orderNumber || selectedOrder?.id || '').slice(-6)}
              </span>{' '}
              as packed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && handleMarkAsPacked(selectedOrder.id)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{' '}
              <span className="font-mono font-semibold">
                #{(selectedOrder?.orderNumber || selectedOrder?.id || '').slice(-6)}
              </span>?{' '}
              <span className="text-red-600 dark:text-red-400 font-semibold">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
