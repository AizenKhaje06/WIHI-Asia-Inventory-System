'use client'

import { useState, useEffect } from 'react'
import { BrandLoader } from '@/components/ui/brand-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Search, Package, RefreshCw, Camera, Eye, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/auth'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showConfirmPack, setShowConfirmPack] = useState(false)
  const [packing, setPacking] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, pendingOrders])

  const fetchData = async () => {
    try {
      setLoading(true)

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
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
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
      
      // Refresh data
      fetchData()

      // Reopen scanner for next order
      setTimeout(() => {
        setScannerOpen(true)
      }, 500)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Packer Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Scan barcodes to pack orders quickly
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setScannerOpen(true)} size="lg" className="gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </Button>
          <Button onClick={fetchData} variant="outline" size="lg">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Packed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packedHistory.filter(p => {
                const packedDate = new Date(p.packedAt).toDateString()
                const today = new Date().toDateString()
                return packedDate === today
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Packed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packedHistory.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Packing Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Packing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order number, waybill, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {filteredPending.length === 0 ? (
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
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      ORDER NO.
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      WAYBILL NO.
                    </th>
                    <th className="text-right py-3 px-3 text-[10px] font-bold">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-3 text-sm">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
      <Card>
        <CardHeader>
          <CardTitle>Packed History</CardTitle>
        </CardHeader>
        <CardContent>
          {packedHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No packed orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      WAYBILL NO.
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      PRODUCT
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      QTY
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] font-bold border-r border-slate-700/50">
                      PACKED AT
                    </th>
                    <th className="text-left py-3 px-3 text-[10px] font-bold">
                      PACKED BY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packedHistory.slice(0, 20).map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="py-3 px-3 text-sm">
                        <span className="font-mono text-slate-900 dark:text-white">
                          {order.waybill}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600 dark:text-slate-400">
                        {order.itemName}
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600 dark:text-slate-400">
                        {order.quantity}
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.packedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600 dark:text-slate-400">
                        {order.packedBy}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-600 dark:text-slate-400">Order No:</div>
                <div className="font-mono font-semibold">{selectedOrder.orderNumber}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Waybill:</div>
                <div className="font-mono font-semibold">{selectedOrder.waybill}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Product:</div>
                <div className="font-semibold">{selectedOrder.itemName}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Quantity:</div>
                <div className="font-semibold">{selectedOrder.quantity}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Customer:</div>
                <div className="font-semibold">{selectedOrder.customerName}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Phone:</div>
                <div className="font-semibold">{selectedOrder.customerPhone}</div>
                
                <div className="text-slate-600 dark:text-slate-400">Channel:</div>
                <div><Badge variant="outline">{selectedOrder.channel}</Badge></div>
                
                <div className="text-slate-600 dark:text-slate-400">Store:</div>
                <div className="font-semibold">{selectedOrder.store}</div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPack}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Packed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Pack Dialog */}
      <AlertDialog open={showConfirmPack} onOpenChange={setShowConfirmPack}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Packing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this order as packed?
              <br />
              <span className="font-mono font-semibold">
                Waybill: {selectedOrder?.waybill}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={packing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPacked} disabled={packing}>
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
