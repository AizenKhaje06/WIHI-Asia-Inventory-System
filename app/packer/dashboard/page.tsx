'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EnterpriseDateRangePicker } from '@/components/ui/enterprise-date-range-picker'
import { Search, Package, RefreshCw, Camera, Eye, CheckCircle, Clock, TrendingUp, Zap, Target, Timer, Award, Activity, LogOut, User, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/auth'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { ThemeToggle } from '@/components/theme-toggle'

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
  const [packing, setPacking] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  
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
      
      // Refresh data immediately (silent)
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

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('displayName')
    
    // Redirect to login (main page)
    window.location.href = '/'
    
    toast.success('Logged out successfully')
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
    <div className="space-y-6 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Professional Corporate Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section with Branding */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 items-center justify-center shadow-xl shadow-blue-500/30 flex-shrink-0">
              <Package className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Packer Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Real-time Order Fulfillment System</span>
                </div>
                {currentUser && (
                  <>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {currentUser.displayName || currentUser.username}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Professional Layout */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setScannerOpen(true)} 
              size="lg" 
              className="flex-1 sm:flex-none gap-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 h-12 px-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
            >
              <Camera className="h-5 w-5" strokeWidth={2.5} />
              <span>Scan Barcode</span>
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
            <div className="h-12 flex items-center">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowLogoutDialog(true)}
              className="h-12 px-4 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.5} />
              <span className="hidden lg:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar - Integrated */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Active</span>
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
      </div>

      {/* Date Filter - Enterprise Style (Same as Admin/Operations) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filter by Date Range</h2>
        <EnterpriseDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
        />
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
                      <th className="text-center py-4 px-2 text-[11px] font-bold text-white uppercase tracking-wider" style={{ width: '14%' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPending.map((order) => (
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
                              {order.itemName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Qty: {order.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 block break-all">
                              {order.waybill}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {order.courier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
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
                          {selectedOrder.itemName}
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
                      Ready to Pack?
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Confirm that all items are packed and ready for dispatch. This action will mark the order as packed.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowOrderDetails(false)}
                      disabled={packing}
                      className="flex-1 h-12 text-base border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmPack}
                      disabled={packing}
                      className="flex-1 h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold shadow-lg"
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

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-600" />
              Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to log in again to access the packer dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Yes, Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
