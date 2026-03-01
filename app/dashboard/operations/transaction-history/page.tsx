'use client'

import { useState, useEffect } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, RefreshCw, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api-client'
import { getCurrentUser } from '@/lib/auth'

interface Order {
  id: string
  date: string
  sales_channel: string
  store: string
  courier: string
  waybill: string
  status: string
  qty: number
  cogs: number
  total: number
  parcel_status: string
  product: string
  dispatched_by: string
  packed_by: string | null
  packed_at: string | null
  created_at: string
}

export default function TransactionHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, salesChannelFilter, orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Fetch only pending orders (not yet packed)
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
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (salesChannelFilter !== 'all') {
      filtered = filtered.filter(order => order.sales_channel === salesChannelFilter)
    }
    
    setFilteredOrders(filtered)
  }

  const handleMarkAsPacked = async (orderId: string) => {
    if (!currentUser) {
      toast.error('User not logged in')
      return
    }

    try {
      const packedBy = currentUser.displayName || currentUser.username || 'Unknown User'
      
      await apiPost(`/api/orders/${orderId}/pack`, {
        packedBy
      })
      
      toast.success('Order marked as packed successfully!')
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error('Error marking order as packed:', error)
      toast.error('Failed to mark order as packed')
    }
  }

  const totalOrders = filteredOrders.length
  const totalQty = filteredOrders.reduce((sum, order) => sum + order.qty, 0)
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Packing Queue</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Orders waiting to be packed and shipped
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Pending
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalOrders}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Orders to Pack</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                Items
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {totalQty}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Quantity</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Value
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by order, store, waybill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        
        <div className="w-[200px]">
          <Select value={salesChannelFilter} onValueChange={setSalesChannelFilter}>
            <SelectTrigger className="h-11">
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
        </div>
      </div>

      {/* Orders Table - Enterprise Grade 10/10 */}
      <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                <Package className="h-12 w-12 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No pending orders</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Orders will appear here after dispatch from Warehouse
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">#</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Date</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Channel</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Store</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Product</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Courier</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Waybill</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider">QTY</th>
                    <th className="py-3 px-3 text-right text-[10px] font-bold text-white uppercase tracking-wider">COGS</th>
                    <th className="py-3 px-3 text-right text-[10px] font-bold text-white uppercase tracking-wider">Total</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider">Dispatched By</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[11px] font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[9px] font-semibold px-2 py-0.5 whitespace-nowrap">
                          {order.sales_channel}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">{order.store}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={order.product}>
                          {order.product}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate">{order.courier}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[11px] font-mono text-slate-900 dark:text-white font-semibold truncate">{order.waybill}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 text-[9px] font-semibold px-2 py-0.5 whitespace-nowrap">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                          {order.qty}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">{formatCurrency(order.cogs)}</div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="text-[11px] font-bold text-green-600 dark:text-green-400 whitespace-nowrap tabular-nums">{formatCurrency(order.total)}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {order.dispatched_by.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{order.dispatched_by}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {order.packed_by ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 text-[9px] font-semibold px-2 py-0.5 whitespace-nowrap">
                              <CheckCircle className="h-2.5 w-2.5 mr-1 inline" />
                              Packed
                            </Badge>
                            <div className="text-[9px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[80px]">{order.packed_by}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkAsPacked(order.id)}
                            className="text-[11px] font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors"
                          >
                            Mark as Packed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
