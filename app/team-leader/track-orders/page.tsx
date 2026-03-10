'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from 'sonner'
import { getTeamLeaderSession, getAuthHeaders } from '@/lib/team-leader-auth'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: string
  parcelStatus: string
  paymentStatus: string
  courier: string
  trackingNumber: string
  orderDate: string
  channel: string
}

/**
 * Team Leader Track Orders Page
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function TrackOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const session = getTeamLeaderSession()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const response = await fetch('/api/team-leader/orders', {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.orders)
      setFilteredOrders(data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchTerm(query)

    if (!query.trim()) {
      setFilteredOrders(orders)
      return
    }

    try {
      setSearching(true)
      const headers = getAuthHeaders()

      const response = await fetch(`/api/team-leader/orders/search?q=${encodeURIComponent(query)}`, {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setFilteredOrders(data.results)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const applyFilters = () => {
    let filtered = orders

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.parcelStatus === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerPhone.includes(searchTerm) ||
        o.orderNumber.includes(searchTerm)
      )
    }

    setFilteredOrders(filtered)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [statusFilter, orders])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'IN TRANSIT': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
      'DELIVERED': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-700', icon: Package }
    }

    const config = statusConfig[status] || statusConfig['PENDING']
    return (
      <Badge className={`${config.bg} ${config.text} border-0`}>
        {status}
      </Badge>
    )
  }

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
    <div className="space-y-5 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1.5">Track Orders</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Manage and track orders for {session?.assignedChannel}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by customer name, phone, or order ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                disabled={searching}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Order ID</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Customer</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Product</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Qty</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Courier</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-medium">#{order.id.slice(-6)}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{order.customerName}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{order.itemName}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{order.quantity}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-medium">₱{order.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-3">{getStatusBadge(order.parcelStatus)}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{order.courier}</td>
                      <td className="py-3 px-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/team-leader/track-orders/${order.id}`}>
                            View
                          </Link>
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
    </div>
  )
}
