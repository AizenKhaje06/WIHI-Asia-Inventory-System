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
  const [selectedChannel, setSelectedChannel] = useState<string>('All')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [packedOrderDetails, setPackedOrderDetails] = useState<Order | null>(null)
  const [packing, setPacking] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Get unique channels
  const channels = useMemo(() => {
    const uniqueChannels = Array.from(new Set(pendingOrders.map(o => o.channel)))
    return ['All', ...uniqueChannels.sort()]
  }, [pendingOrders])

  // Performance metrics - filtered by channel
  const todayPacked = useMemo(() => {
    const today = new Date().toDateString()
    return packedHistory.filter(p => {
      const packedDate = new Date(p.packedAt).toDateString()
      return packedDate === today
    })
  }, [packedHistory])

  // Filtered packed history by channel
  const filteredPackedHistory = useMemo(() => {
    if (selectedChannel === 'All') return packedHistory
    
    // We need to match waybills with pending orders to get channel info
    // For packed orders, we'll show all if channel filter is active
    // since we don't store channel in packed history
    return packedHistory
  }, [packedHistory, selectedChannel])

  // Pending count filtered by channel
  const pendingCount = useMemo(() => {
    if (selectedChannel === 'All') return pendingOrders.length
    return pendingOrders.filter(o => o.channel === selectedChannel).length
  }, [pendingOrders, selectedChannel])

  const avgPackingTime = useMemo(() => {
    if (todayPacked.length < 2) return 0
    const times = todayPacked.slice(0, 10).map(p => new Date(p.packedAt).getTime())
    const diffs = times.slice(1).map((t, i) => t - times[i])
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return Math.round(avg / 1000)
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
  }, [searchTerm, selectedChannel, pendingOrders])

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
    let filtered = pendingOrders

    // Filter by channel
    if (selectedChannel !== 'All') {
      filtered = filtered.filter(order => order.channel === selectedChannel)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPending(filtered)
  }

  const handleScan = async (waybill: string) => {
    // Find order by waybill
    const order = pendingOrders.find(o => 
      o.waybill.toLowerCase() === waybill.toLowerCase()
    )

    if (!order) {
      toast.error('Order not found in queue')
      return
    }

    // Auto-pack immediately after scan
    await handleAutoPackOrder(order)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleAutoPackOrder = async (order: Order) => {
    if (!currentUser) return

    try {
      setPacking(true)
      setScannerOpen(false) // Close scanner

      const response = await fetch(`/api/packer/pack/${order.id}`, {
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

      // Show success modal with order details
      setPackedOrderDetails(order)
      setShowSuccessModal(true)
      
      // Refresh data immediately
      await fetchData(true)

      // Auto-close success modal and reopen scanner after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
        setPackedOrderDetails(null)
        setScannerOpen(true)
      }, 3000)
    } catch (error) {
      console.error('Error packing order:', error)
      toast.error('Failed to pack order')
      setScannerOpen(true) // Reopen scanner on error
    } finally {
      setPacking(false)
    }
  }

  const handleConfirmPack = async () => {
    if (!selectedOrder) return
    setShowOrderDetails(false)
    await handleAutoPackOrder(selectedOrder)
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
      {/* Professional Corporate Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section with Branding */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Package className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Packer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap font-medium">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Real-time Order Fulfillment System</span>
                {currentUser && (
                  <>
                    <span className="hidden sm:inline text-slate-400">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {currentUser.displayName || currentUser.username}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons - Professional Layout */}
          <div className="flex gap-3">
            <Button 
              onClick={() => setScannerOpen(true)} 
              size="lg" 
              className="flex-1 lg:flex-none gap-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 h-12 px-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
            >
              <Camera className="h-5 w-5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Scan Barcode</span>
              <span className="sm:hidden">Scan</span>
            </Button>
            <Button 
              onClick={() => fetchData()} 
              variant="outline" 
              size="lg"
              disabled={refreshing}
              className="h-12 px-4 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar - Professional Metrics */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">System Active</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {selectedChannel !== 'All' && (
            <>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <Badge variant="secondary" className="font-semibold">
                {selectedChannel}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards - Professional 4-Card Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Orders */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Pending Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 relative">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">
              <AnimatedNumber value={pendingCount} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {pendingCount === 0 ? '✨ All caught up!' : `${pendingCount} ${pendingCount === 1 ? 'order' : 'orders'} ready`}
            </p>
            <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${Math.min((pendingCount / 50) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Packed */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Today's Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 relative">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">
              <AnimatedNumber value={todayPacked.length} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {todayPacked.length > 0 ? `🎯 ${todayPacked.length} packed today` : 'Start packing'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">
                {todayPacked.length > 0 ? '+' : ''}{todayPacked.length} today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Packing Time */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Avg Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 relative">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {avgPackingTime > 0 ? (
                <><AnimatedNumber value={avgPackingTime} />s</>
              ) : (
                '--'
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {avgPackingTime > 0 ? 'Per order' : 'No data yet'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">
                {avgPackingTime > 0 && avgPackingTime < 60 ? 'Fast!' : avgPackingTime >= 60 ? 'Good pace' : 'Start packing'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Packs Per Hour */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2 sm:pb-3 relative">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Productivity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 relative">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {packsPerHour > 0 ? (
                <><AnimatedNumber value={packsPerHour} />/h</>
              ) : (
                '--'
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {packsPerHour > 0 ? 'Orders per hour' : 'No data yet'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Award className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">
                {packsPerHour >= 30 ? 'Excellent!' : packsPerHour >= 20 ? 'Great!' : packsPerHour > 0 ? 'Good!' : 'Start packing'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packing Queue */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Packing Queue
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {filteredPending.length} {filteredPending.length === 1 ? 'order' : 'orders'} ready
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedChannel !== 'All' && (
                <Badge variant="secondary" className="text-xs">
                  {selectedChannel}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Searching
                </Badge>
              )}
              {!searchTerm && selectedChannel === 'All' && (
                <Badge variant="outline" className="text-xs">
                  All Orders
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Filters */}
          <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-0 sm:flex sm:gap-3">
            {/* Channel Filter */}
            <div className="sm:w-48">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {channels.map(channel => (
                  <option key={channel} value={channel}>
                    {channel === 'All' ? 'All Channels' : channel}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search order, waybill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          {filteredPending.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                {searchTerm ? 'No matching orders' : 'No orders in queue'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm ? 'Try different search' : 'All packed! 🎉'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider border-r border-slate-700/50">
                      WAYBILL NO.
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider border-r border-slate-700/50">
                      CHANNEL
                    </th>
                    <th className="text-center py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider">
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
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 block">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {order.channel}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="h-9 px-4 text-sm bg-blue-600 hover:bg-blue-700 gap-2 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
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
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Packed History
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Recent activity
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs w-fit">
              Last {packedHistory.length > 20 ? '20' : packedHistory.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {filteredPackedHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">No packed orders yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Start packing to see history
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider border-r border-slate-700/50">
                      WAYBILL NO.
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider border-r border-slate-700/50">
                      PACKED AT
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-bold tracking-wider">
                      PACKED BY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackedHistory.slice(0, 20).map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-100 dark:border-slate-800 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 block">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(order.packedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px]">
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

      {/* Order Details Dialog (for View button) - Enterprise Level */}
      <AlertDialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-2xl border-t-4 border-t-blue-600">
          <AlertDialogHeader className="border-b pb-4">
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Order Details
            </AlertDialogTitle>
          </AlertDialogHeader>
          {selectedOrder && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto py-2">
              {/* Waybill Highlight Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="text-center space-y-2">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Waybill Number
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-blue-700 dark:text-blue-300 break-all">
                    {selectedOrder.waybill}
                  </div>
                </div>
              </div>

              {/* Order Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Order Number */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Order Number
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 break-all">
                    {selectedOrder.orderNumber}
                  </div>
                </div>

                {/* Channel */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Sales Channel
                  </div>
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {selectedOrder.channel}
                  </Badge>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Product
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                      {selectedOrder.itemName}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Quantity:</span>
                      <Badge variant="outline" className="font-bold">
                        {selectedOrder.quantity} {selectedOrder.quantity === 1 ? 'pc' : 'pcs'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-slate-400"></div>
                  Customer Information
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 flex-shrink-0 pt-1">
                      Name
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words flex-1">
                      {selectedOrder.customerName}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 flex-shrink-0 pt-1">
                      Phone
                    </div>
                    <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 break-all flex-1">
                      {selectedOrder.customerPhone}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 flex-shrink-0 pt-1">
                      Address
                    </div>
                    <div className="text-sm text-slate-900 dark:text-slate-100 break-words flex-1">
                      {selectedOrder.customerAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Store & Courier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Store
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedOrder.store}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Courier
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedOrder.courier}
                  </div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
            <AlertDialogCancel className="w-full sm:w-auto m-0 h-11 text-base" disabled={packing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPack} 
              disabled={packing} 
              className="w-full sm:w-auto m-0 h-11 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold"
            >
              {packing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Packing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark as Packed
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal - Auto-closes after 3 seconds */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg border-2 border-green-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Successfully Packed!
            </AlertDialogTitle>
          </AlertDialogHeader>
          {packedOrderDetails && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center space-y-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Waybill Number</div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 break-all">
                    {packedOrderDetails.waybill}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Product:</div>
                  <div className="font-semibold">{packedOrderDetails.itemName}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Quantity:</div>
                  <div className="font-semibold">{packedOrderDetails.quantity}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Customer:</div>
                  <div className="font-semibold">{packedOrderDetails.customerName}</div>
                </div>
                
                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Channel:</div>
                  <div><Badge variant="outline" className="text-xs">{packedOrderDetails.channel}</Badge></div>
                </div>

                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Store:</div>
                  <div className="font-semibold">{packedOrderDetails.store}</div>
                </div>

                <div className="flex flex-col sm:contents">
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Packed By:</div>
                  <div className="font-semibold">{currentUser?.displayName || currentUser?.username}</div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2 border-t">
                Auto-closing in 3 seconds...
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
