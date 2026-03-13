'use client'

import { useState, useEffect } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Search, Package, RefreshCw, CheckCircle, ShoppingCart, TrendingUp } from 'lucide-react'
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

  // Role detection
  const userRole = getCurrentUserRole()
  const isTeamLeader = userRole === 'team_leader'

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
      const data = await apiGet<Order[]>('/api/orders?status=Pending')
      setOrders(data)
      setFilteredOrders(data)
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Waybill No.
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
                      Store
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
                          {order.waybill || order.id || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.date || order.orderDate || order.created_at || '').toLocaleDateString()}
                      </td>
                      {!isTeamLeader && (
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">
                            {order.sales_channel || order.channel || 'N/A'}
                          </Badge>
                        </td>
                      )}
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {order.store}
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
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(order)}
                          disabled={packing === order.id}
                        >
                          {packing === order.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Packing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Packed
                            </>
                          )}
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
    </div>
  )
}
