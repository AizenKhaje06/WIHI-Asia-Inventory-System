'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EnterpriseDateRangePicker } from '@/components/ui/enterprise-date-range-picker'
import { Search, Package, RefreshCw, Camera, Eye, CheckCircle, Clock, TrendingUp, Zap, Target, Timer, Award, Truck, User } from 'lucide-react'
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
  is_cancelled?: boolean
}

interface PackedOrder {
  id: string
  waybill: string
  itemName: string
  quantity: number
  totalAmount: number
  customerName: string
  packedAt: string
  packedBy: string
}

export default function PackerDashboard() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [packedHistory, setPackedHistory] = useState<PackedOrder[]>([])
  const [filteredPending, setFilteredPending] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<string>('All')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [packing, setPacking] = useState(false)
  
  // Date filter states - using same format as Admin/Operations dashboard (Date objects, not strings)
  // Default to current month
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
  })

  // Get unique channels
  const channels = useMemo(() => {
    const uniqueChannels = Array.from(new Set(pendingOrders.map(o => o.channel)))
    return ['All', ...uniqueChannels.sort()]
  }, [pendingOrders])

  // Performance metrics - filtered by date range
  const todayPacked = useMemo(() => {
    if (!startDate || !endDate) return packedHistory
    
    return packedHistory.filter(p => {
      const packedDate = new Date(p.packedAt)
      return packedDate >= startDate && packedDate <= endDate
    })
  }, [packedHistory, startDate, endDate])

  // Filtered packed history by date range
  const filteredPackedHistory = useMemo(() => {
    if (!startDate || !endDate) return packedHistory
    
    return packedHistory.filter(p => {
      const packedDate = new Date(p.packedAt)
      return packedDate >= startDate && packedDate <= endDate
    })
  }, [packedHistory, startDate, endDate])

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

    // Auto-refresh every 30 seconds silently in the background
    const interval = setInterval(() => {
      fetchData(true) // Silent refresh
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, selectedChannel, pendingOrders])

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      // Fetch pending orders
      const queueResponse = await fetch('/api/packer/queue')
      const queueData = await queueResponse.json()

      if (!queueResponse.ok) {
        throw new Error(queueData.error || 'Failed to fetch queue')
      }

      // Only update state if data actually changed (prevents flickering)
      const newQueue = queueData.queue || []
      setPendingOrders(prev => {
        const prevIds = prev.map(o => o.id).join(',')
        const newIds = newQueue.map((o: Order) => o.id).join(',')
        return prevIds === newIds ? prev : newQueue
      })
      setFilteredPending(prev => {
        const prevIds = prev.map(o => o.id).join(',')
        const newIds = newQueue.map((o: Order) => o.id).join(',')
        return prevIds === newIds ? prev : newQueue
      })

      // Fetch packed history
      const historyResponse = await fetch('/api/packer/history')
      const historyData = await historyResponse.json()

      if (!historyResponse.ok) {
        throw new Error(historyData.error || 'Failed to fetch history')
      }

      const newHistory = historyData.history || []
      setPackedHistory(prev => {
        const prevIds = prev.map((o: PackedOrder) => o.id).join(',')
        const newIds = newHistory.map((o: PackedOrder) => o.id).join(',')
        return prevIds === newIds ? prev : newHistory
      })

    } catch (error) {
      console.error('Error fetching data:', error)
      if (!silent) {
        toast.error('Failed to load data')
      }
    } finally {
      setLoading(false)
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

    // Check if order is cancelled
    if ((order as any).is_cancelled) {
      toast.error('⚠️ This order is already cancelled', {
        description: 'This order was cancelled by the department and cannot be packed.',
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px 24px',
        }
      })
      return
    }

    // Auto-pack immediately after scan and WAIT for it to complete
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

      // OPTIMISTIC UPDATE: Remove from pending immediately
      setPendingOrders(prev => prev.filter(o => o.id !== order.id))
      setFilteredPending(prev => prev.filter(o => o.id !== order.id))

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
        // ROLLBACK: Add back to pending if failed
        setPendingOrders(prev => [...prev, order])
        setFilteredPending(prev => [...prev, order])
        throw new Error(data.error || 'Failed to pack order')
      }

      // Show quick success notification (auto-dismiss after 2 seconds)
      toast.success(
        `✅ Successfully packed! Waybill: ${order.waybill}`,
        {
          duration: 2000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px 24px',
          }
        }
      )
      
      // Refresh data in background (to sync with server)
      await fetchData(true)

      // Scanner stays open for next scan - no need to reopen
    } catch (error) {
      console.error('Error packing order:', error)
      toast.error('❌ Failed to pack order. Please try again.')
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
    <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">Packer Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Scan and pack orders for dispatch
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <EnterpriseDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start)
              setEndDate(end)
            }}
          />
          <Button 
            onClick={() => setScannerOpen(true)} 
            className="h-10 px-4 gap-2 text-sm font-semibold w-full sm:w-auto border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-orange-500 via-orange-600 to-black hover:from-orange-600 hover:via-orange-700 hover:to-gray-900"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Barcode</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {/* Pending Orders */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-1.5 sm:pb-2 md:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="leading-tight">Pending Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent">
              <AnimatedNumber value={pendingCount} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium leading-tight">
              {pendingCount === 0 ? '✨ All caught up!' : `${pendingCount} ${pendingCount === 1 ? 'order' : 'orders'} ready`}
            </p>
            <div className="mt-2 sm:mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${Math.min((pendingCount / 50) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Packed */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-1.5 sm:pb-2 md:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="leading-tight">Today's Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent">
              <AnimatedNumber value={todayPacked.length} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium leading-tight">
              {todayPacked.length > 0 ? `🎯 ${todayPacked.length} packed today` : 'Start packing'}
            </p>
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
              <span className="text-[10px] sm:text-xs font-semibold text-green-600">
                {todayPacked.length > 0 ? '+' : ''}{todayPacked.length} today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Packing Time */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-1.5 sm:pb-2 md:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Timer className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="leading-tight">Avg Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {avgPackingTime > 0 ? (
                <><AnimatedNumber value={avgPackingTime} />s</>
              ) : (
                '--'
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium leading-tight">
              {avgPackingTime > 0 ? 'Per order' : 'No data yet'}
            </p>
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
              <span className="text-[10px] sm:text-xs font-semibold text-blue-600">
                {avgPackingTime > 0 && avgPackingTime < 60 ? 'Fast!' : avgPackingTime >= 60 ? 'Good pace' : 'Start packing'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Packs Per Hour */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <CardHeader className="pb-1.5 sm:pb-2 md:pb-3 relative px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="leading-tight">Productivity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4 relative px-3 sm:px-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {packsPerHour > 0 ? (
                <><AnimatedNumber value={packsPerHour} />/h</>
              ) : (
                '--'
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium leading-tight">
              {packsPerHour > 0 ? 'Orders per hour' : 'No data yet'}
            </p>
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
              <span className="text-[10px] sm:text-xs font-semibold text-purple-600">
                {packsPerHour >= 30 ? 'Excellent!' : packsPerHour >= 20 ? 'Great!' : packsPerHour > 0 ? 'Good!' : 'Start packing'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packing Queue */}
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Packing Queue
                </CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  {filteredPending.length} {filteredPending.length === 1 ? 'order' : 'orders'} ready
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap justify-end flex-shrink-0">
                {selectedChannel !== 'All' && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {selectedChannel}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    Searching
                  </Badge>
                )}
                {!searchTerm && selectedChannel === 'All' && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    All Orders
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Filters */}
          <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-0 sm:flex sm:gap-3 sm:items-center">
            {/* Search - Now First */}
            <div className="sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search order, waybill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 text-sm"
                />
              </div>
            </div>

            {/* Channel Filter - Now Second */}
            <div className="sm:w-48">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-0 focus:border-slate-300 dark:focus:border-slate-600 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                {channels.map(channel => (
                  <option key={channel} value={channel}>
                    {channel === 'All' ? 'All Channels' : channel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredPending.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {searchTerm ? 'No matching orders' : 'No orders in queue'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                {searchTerm ? 'Try different search' : 'All packed! 🎉'}
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
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                        Date
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '12%' }}>
                        Name
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '18%' }}>
                        Address
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '11%' }}>
                        Contact No.
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '16%' }}>
                        Items
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                        Price
                      </th>
                      <th className="text-left py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50" style={{ width: '11%' }}>
                        Tracking
                      </th>
                      <th className="text-center py-4 px-3 text-[11px] font-bold text-white uppercase tracking-wider" style={{ width: '12%' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPending.map((order) => (
                      <tr
                        key={order.id}
                        className={`transition-all duration-200 cursor-pointer ${
                          order.is_cancelled 
                            ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-3">
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
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-900 dark:text-white font-medium block break-words">
                            {order.customerName}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 block break-words leading-relaxed">
                            {order.customerAddress}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-mono text-slate-900 dark:text-white font-medium block break-words">
                            {order.customerPhone}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-slate-900 dark:text-white font-medium block break-words">
                              {order.itemName.replace(/\s*\(\d+\)\s*$/, '')}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Qty: {order.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            ₱{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 block break-all">
                                {order.waybill}
                              </span>
                              {order.is_cancelled && (
                                <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 font-bold">
                                  CANCELLED
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {order.courier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="h-8 px-3 text-[11px] font-medium border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 whitespace-nowrap rounded-lg"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View Details
                            </Button>
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

      {/* Packed History */}
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Packed History
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Recent activity
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
              Last {filteredPackedHistory.length > 20 ? '20' : filteredPackedHistory.length}
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
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '12%' }}>
                      DATE
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '15%' }}>
                      CUSTOMER
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '20%' }}>
                      ITEM
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '8%' }}>
                      QTY
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '10%' }}>
                      PRICE
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider border-r border-slate-700/50" style={{ width: '15%' }}>
                      WAYBILL
                    </th>
                    <th className="text-left py-3 px-3 text-[11px] font-bold tracking-wider" style={{ width: '20%' }}>
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
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {new Date(order.packedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: '2-digit'
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(order.packedAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-900 dark:text-white font-medium block truncate">
                          {order.customerName || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 block truncate">
                          {(order.itemName || 'N/A').replace(/\s*\(\d+\)\s*$/, '')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-semibold text-slate-900 dark:text-white">
                          {order.quantity || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">
                          ₱{(order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] font-semibold text-green-600 dark:text-green-400 block truncate">
                          {order.waybill || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {order.packedBy || 'Unknown'}
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

      {/* Order Details Dialog (for View button) - Professional Design matching Tracker */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
          {/* Modal Header with Gradient */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6 border-b border-slate-600 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-white">Order Details</span>
              </DialogTitle>
              <p className="text-slate-200 text-sm mt-2 font-medium">
                Review order information before packing
              </p>
            </DialogHeader>
          </div>

          {selectedOrder && (
            <>
              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 px-8 py-6">
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
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Delivery Address
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                          {selectedOrder.customerAddress}
                        </p>
                      </div>
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
                          #{selectedOrder.orderNumber.slice(-6)}
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
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Qty: {selectedOrder.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Total Amount
                        </p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₱{selectedOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
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
                          Waybill Number
                        </p>
                        <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400">
                          {selectedOrder.waybill}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Sales Channel
                        </p>
                        <Badge variant="secondary" className="text-sm font-semibold">
                          {selectedOrder.channel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Store
                        </p>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                          {selectedOrder.store}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Action Buttons - Fixed at bottom */}
              <div className="border-t border-slate-200 dark:border-slate-700 px-8 py-6 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                      {selectedOrder.is_cancelled ? 'Order Cancelled' : 'Ready to Pack?'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedOrder.is_cancelled 
                        ? 'This order has been cancelled and cannot be packed.' 
                        : 'Confirm that all items are packed and ready for dispatch. This action will mark the order as packed.'}
                    </p>
                  </div>
                  
                  {selectedOrder.is_cancelled && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            Order Cancelled
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                            This order was cancelled by the department and cannot be packed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowOrderDetails(false)}
                      disabled={packing}
                      className="flex-1 h-12 text-base border-2"
                    >
                      {selectedOrder.is_cancelled ? 'Close' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={handleConfirmPack}
                      disabled={packing || selectedOrder.is_cancelled}
                      className="flex-1 h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
