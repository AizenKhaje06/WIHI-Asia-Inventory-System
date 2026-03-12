'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Search, Package, RefreshCw, Camera, Eye, CheckCircle, Clock, TrendingUp, Zap, Target, Timer, Award, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/auth'
import { AnimatedNumber } from '@/components/ui/animated-number'

interface Order {
  id: string
  orderNumber: string
  waybill: string
  customerName: string
  customerPhone: string
  customerAddress: string
  itemName: string
  quantity: number
  totalAmount: number
  orderStatus: string
  parcelStatus: string
  orderDate: string
  channel: string
  store: string
  courier: string
}

interface PackedOrder {
  id: string
  waybill: string
  itemName: string
  quantity: number
  packedAt: string
  packedBy: string
}

export default function PackerDashboard() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [packedHistory, setPackedHistory] = useState<PackedOrder[]>([])
  const [filteredPending, setFilteredPending] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showConfirmPack, setShowConfirmPack] = useState(false)
  const [packing, setPacking] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Performance metrics
  const todayPacked = useMemo(() => {
    return packedHistory.filter(p => {
      const packedDate = new Date(p.packedAt).toDateString()
      const today = new Date().toDateString()
      return packedDate === today
    })
  }, [packedHistory])

  const avgPackingTime = useMemo(() => {
    if (todayPacked.length < 2) return 0
    // Estimate based on time between packs
    const times = todayPacked.slice(0, 10).map(p => new Date(p.packedAt).getTime())
    const diffs = times.slice(1).map((t, i) => t - times[i])
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return Math.round(avg / 1000) // Convert to seconds
  }, [todayPacked])

  const packsPerHour = useMemo(() => {
    if (avgPackingTime === 0) return 0
    return Math.round(3600 / avgPackingTime)
  }, [avgPackingTime])

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchData()

    // Auto-refresh every 2 minutes (less aggressive)
    if (autoRefreshEnabled) {
      const interval = setInterval(() => {
        fetchData(true) // Silent refresh
      }, 120000) // 2 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefreshEnabled])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, pendingOrders])

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      if (!silent) setRefreshing(true)

      // Fetch pending orders
      const queueResponse = await fetch('/api/packer/queue')
      const queueData = await queueResponse.json()

      if (!queueResponse.ok) {
        throw new Error(queueData.error || 'Failed to fetch queue')
      }

      setPendingOrders(queueData.queue || [])
      setFilteredPending(queueData.queue || [])

      // Fetch packed history
      const historyResponse = await fetch('/api/packer/history')
      const historyData = await historyResponse.json()

      if (!historyResponse.ok) {
        throw new Error(historyData.error || 'Failed to fetch history')
      }

      setPackedHistory(historyData.history || [])
      
      // Completely silent - no toast notification
    } catch (error) {
      console.error('Error fetching data:', error)
      if (!silent) {
        toast.error('Failed to load data')
      }
    } finally {
      setLoading(false)
      if (!silent) setRefreshing(false)
    }
  }

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredPending(pendingOrders)
      return
    }

    const filtered = pendingOrders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredPending(filtered)
  }

  const handleScan = (waybill: string) => {
    // Find order by waybill
    const order = pendingOrders.find(o => 
      o.waybill.toLowerCase() === waybill.toLowerCase()
    )

    if (!order) {
      toast.error('Order not found in queue')
      return
    }

    // Show order details
    setSelectedOrder(order)
    setShowOrderDetails(true)
    toast.success('Order found!')
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleConfirmPack = () => {
    setShowOrderDetails(false)
    setShowConfirmPack(true)
  }

  const handleMarkAsPacked = async () => {
    if (!selectedOrder || !currentUser) return

    try {
      setPacking(true)

      const response = await fetch(`/api/packer/pack/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packedBy: currentUser.displayName || currentUser.username
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pack order')
      }

      toast.success('Order packed successfully!')
      setShowConfirmPack(false)
      setSelectedOrder(null)
      
      // Refresh data immediately
      await fetchData(true)

      // Reopen scanner for next order after short delay
      setTimeout(() => {
        setScannerOpen(true)
      }, 800)
    } catch (error) {
      console.error('Error packing order:', error)
      toast.error('Failed to pack order')
    } finally {
      setPacking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading packer dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8 px-2 sm:px-0">
      {/* Header with Performance Metrics */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Packer Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Real-time order packing system</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setScannerOpen(true)} 
              size="lg" 
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-11 sm:h-12"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Scan Barcode</span>
              <span className="xs:hidden">Scan</span>
            </Button>
            <Button 
              onClick={() => fetchData()} 
              variant="outline" 
              size="lg"
              disabled={refreshing}
              className="h-11 sm:h-12 px-3 sm:px-4"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Pending Orders</span>
              <span className="sm:hidden">Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
              <AnimatedNumber value={pendingOrders.length} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {pendingOrders.length === 0 ? 'All caught up!' : 'Ready to pack'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Packed Today</span>
              <span className="sm:hidden">Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              <AnimatedNumber value={todayPacked.length} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {todayPacked.length > 0 ? 'Great progress!' : 'Start packing'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Avg. Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {avgPackingTime > 0 ? `${avgPackingTime}s` : '--'}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {avgPackingTime > 0 ? 'Per order' : 'No data yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {packsPerHour > 0 ? packsPerHour : '--'}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {packsPerHour > 0 ? 'Orders/hr' : 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Packing Queue */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Packing Queue
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {filteredPending.length} {filteredPending.length === 1 ? 'order' : 'orders'} ready to pack
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm w-fit">
              {searchTerm ? 'Filtered' : 'All Orders'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search order, waybill, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          {filteredPending.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg">
                {searchTerm ? 'No matching orders found' : 'No orders in queue'}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                {searchTerm ? 'Try a different search term' : 'All orders have been packed! 🎉'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg border">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50">
                      ORDER NO.
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50">
                      WAYBILL
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50 hidden md:table-cell">
                      PRODUCT
                    </th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50 hidden sm:table-cell">
                      QTY
                    </th>
                    <th className="text-right py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block truncate max-w-[100px] sm:max-w-none">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 block truncate max-w-[100px] sm:max-w-none">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 block truncate max-w-[200px]">
                          {order.itemName}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-center hidden sm:table-cell">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {order.quantity}
                        </Badge>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 h-8 px-2 sm:px-3 text-xs"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">View</span>
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

      {/* Packed History */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Packed History
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Recent packing activity
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
              Last {packedHistory.length > 20 ? '20' : packedHistory.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {packedHistory.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg">No packed orders yet</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                Start packing to see your history here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg border">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50">
                      WAYBILL
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50 hidden md:table-cell">
                      PRODUCT
                    </th>
                    <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50 hidden sm:table-cell">
                      QTY
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider border-r border-slate-700/50">
                      PACKED AT
                    </th>
                    <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider hidden lg:table-cell">
                      PACKED BY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packedHistory.slice(0, 20).map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-100 dark:border-slate-800 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 block truncate max-w-[100px] sm:max-w-none">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 block truncate max-w-[200px]">
                          {order.itemName}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-center hidden sm:table-cell">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {order.quantity}
                        </Badge>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 block">
                          {new Date(order.packedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                        <Badge variant="outline" className="font-medium text-xs">
                          {order.packedBy}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Order Details Dialog */}
      <AlertDialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Order Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedOrder && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Order No:</div>
                  <div className="font-mono font-semibold break-all">{selectedOrder.orderNumber}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Waybill:</div>
                  <div className="font-mono font-semibold break-all text-blue-600 dark:text-blue-400">{selectedOrder.waybill}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Product:</div>
                  <div className="font-semibold">{selectedOrder.itemName}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Quantity:</div>
                  <div className="font-semibold">{selectedOrder.quantity}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Customer:</div>
                  <div className="font-semibold">{selectedOrder.customerName}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Phone:</div>
                  <div className="font-semibold break-all">{selectedOrder.customerPhone}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Channel:</div>
                  <div><Badge variant="outline" className="text-xs">{selectedOrder.channel}</Badge></div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Store:</div>
                  <div className="font-semibold">{selectedOrder.store}</div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPack} className="w-full sm:w-auto m-0">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Packed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Pack Dialog */}
      <AlertDialog open={showConfirmPack} onOpenChange={setShowConfirmPack}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirm Packing</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to mark this order as packed?
              <br />
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 break-all block mt-2">
                Waybill: {selectedOrder?.waybill}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={packing} className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPacked} disabled={packing} className="w-full sm:w-auto m-0">
              {packing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Packing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
