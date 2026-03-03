"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, ShoppingCart, Trash2, CheckCircle, Package, Monitor, Users, Calendar, FileText, PieChart, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BrandLoader } from "@/components/ui/brand-loader"
import type { InventoryItem, Transaction } from "@/lib/types"
import { apiGet, apiPost } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency, cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"

interface CartItem {
  item: InventoryItem
  quantity: number
}

export default function InternalUsagePage() {
  // Table data
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTable, setSearchTable] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")
  
  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProducts, setSearchProducts] = useState("")
  const [loading, setLoading] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [dispatchId, setDispatchId] = useState('')
  const [dispatchedItems, setDispatchedItems] = useState<Array<{name: string, quantity: number, price: number}>>([])
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  
  // Dispatch Form States
  const [purpose, setPurpose] = useState('')
  const [salesChannel, setSalesChannel] = useState('')
  const [notes, setNotes] = useState('')

  const cartTotal = cart.reduce((sum, cartItem) => sum + cartItem.item.costPrice * cartItem.quantity, 0)

  const filteredProducts = items.filter(item => {
    if (!searchProducts) return true
    const searchLower = searchProducts.toLowerCase()
    return item.name.toLowerCase().includes(searchLower) || 
           item.category.toLowerCase().includes(searchLower)
  })

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filterType !== "all") {
      if (filterType === "demo" && transaction.transactionType !== "demo") return false
      if (filterType === "internal" && transaction.transactionType !== "internal") return false
      if (filterType === "transfer" && transaction.transactionType !== "transfer") return false
    }
    
    // Filter by search
    if (!searchTable) return true
    const searchLower = searchTable.toLowerCase()
    return transaction.itemName.toLowerCase().includes(searchLower) ||
           transaction.department?.toLowerCase().includes(searchLower) ||
           transaction.staffName?.toLowerCase().includes(searchLower)
  })

  // Analytics calculations
  const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0)
  const demoTransactions = transactions.filter(t => t.transactionType === 'demo')
  const internalTransactions = transactions.filter(t => t.transactionType === 'internal')
  const transferTransactions = transactions.filter(t => t.transactionType === 'transfer')
  
  const demoCost = demoTransactions.reduce((sum, t) => sum + t.totalCost, 0)
  const internalCost = internalTransactions.reduce((sum, t) => sum + t.totalCost, 0)
  const transferCost = transferTransactions.reduce((sum, t) => sum + t.totalCost, 0)
  
  // Sales channel breakdown
  const salesChannelData = transactions.reduce((acc, t) => {
    if (t.department && (t.transactionType === 'demo' || t.transactionType === 'internal')) {
      const parts = t.department.split(' / ')
      if (parts.length > 1) {
        const channel = parts[1]
        if (!acc[channel]) {
          acc[channel] = { count: 0, cost: 0 }
        }
        acc[channel].count++
        acc[channel].cost += t.totalCost
      }
    }
    return acc
  }, {} as Record<string, { count: number, cost: number }>)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      const name = currentUser.displayName || currentUser.username || 'Unknown User'
      setStaffName(name)
    } else {
      setStaffName('Unknown User')
    }
    
    fetchTransactions()
    fetchItems()
  }, [])

  async function fetchTransactions() {
    try {
      const data = await apiGet<Transaction[]>("/api/internal-usage")
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[Internal Usage] Error fetching transactions:", error)
      setTransactions([])
    }
  }

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[Internal Usage] Error fetching items:", error)
      setItems([])
    }
  }

  function addToCart(item: InventoryItem) {
    const existingItem = cart.find((cartItem) => cartItem.item.id === item.id)

    if (existingItem) {
      if (existingItem.quantity < item.quantity) {
        setCart(
          cart.map((cartItem) =>
            cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          ),
        )
        toast.success(`${item.name} quantity increased to ${existingItem.quantity + 1}`, {
          duration: 2000,
          icon: '➕',
        })
      } else {
        toast.warning(`Maximum stock reached for ${item.name}`, {
          duration: 2000,
          icon: '⚠️',
        })
      }
    } else {
      setCart([...cart, { item, quantity: 1 }])
      toast.success(`${item.name} added to cart`, {
        duration: 2000,
        icon: '✓',
      })
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    const cartItem = cart.find((ci) => ci.item.id === itemId)
    if (!cartItem) return

    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    const finalQuantity = Math.min(quantity, cartItem.item.quantity)
    setCart(cart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: finalQuantity } : ci)))
  }

  function removeFromCart(itemId: string) {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
  }

  async function handleDispatch() {
    if (cart.length === 0 || !purpose || !staffName) {
      alert('Please add items and select a purpose')
      return
    }
    
    // Check if purpose requires sales channel
    if ((purpose === 'Demo/Display' || purpose === 'Internal Use') && !salesChannel) {
      alert('Please select a sales channel')
      return
    }

    setLoading(true)
    try {
      const saleItems = cart.map((cartItem) => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      }))

      // Combine purpose and sales channel
      const finalDepartment = salesChannel 
        ? `${purpose} / ${salesChannel}`
        : purpose

      await apiPost("/api/sales", {
        items: saleItems,
        department: finalDepartment,
        staffName,
        notes
      })

      // Generate dispatch ID
      const newDispatchId = `INT-${Date.now()}`
      setDispatchId(newDispatchId)
      
      // Store dispatched items for display
      setDispatchedItems(cart.map(cartItem => ({
        name: cartItem.item.name,
        quantity: cartItem.quantity,
        price: cartItem.item.costPrice
      })))
      
      // Reset
      setCart([])
      setPurpose('')
      setSalesChannel('')
      setNotes('')
      setDispatchModalOpen(false)
      setSuccessModalOpen(true)
      
      // Refresh data
      fetchItems()
      fetchTransactions()
    } catch (error) {
      console.error("Error dispatching items:", error)
      alert("Failed to dispatch items")
    } finally {
      setLoading(false)
    }
  }

  function openDispatchModal() {
    setCart([])
    setPurpose('')
    setSalesChannel('')
    setNotes('')
    setSearchProducts('')
    setDispatchModalOpen(true)
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-2 pb-12">
      {/* Page Header - Enterprise Premium */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2 tracking-tight">
              Internal Usage Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track demo displays, internal consumption, and warehouse transfers with real-time cost analytics
            </p>
          </div>
          <Button 
            onClick={openDispatchModal}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-full px-6 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm font-semibold">Dispatch Items</span>
          </Button>
        </div>
      </div>

      {/* Tabs - Enterprise Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5 text-sm font-medium transition-all duration-200 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400"
          >
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="sales-channels"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5 text-sm font-medium transition-all duration-200 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales Channels
          </TabsTrigger>
          <TabsTrigger 
            value="cost-analysis"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5 text-sm font-medium transition-all duration-200 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="transaction-history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-2.5 text-sm font-medium transition-all duration-200 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400"
          >
            <Calendar className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards - Enterprise Premium */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Cost Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Total Cost
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(totalCost)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 text-slate-600 dark:text-slate-400">
                    <Package className="h-3 w-3" />
                    {transactions.length} total
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Demo/Display Card */}
            <Card className="border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Demo/Display
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {formatCurrency(demoCost)}
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {demoTransactions.length} transactions
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Internal Use Card */}
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Internal Use
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                  {formatCurrency(internalCost)}
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {internalTransactions.length} transactions
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Warehouse Transfer Card */}
            <Card className="border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    Warehouse Transfer
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(transferCost)}
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {transferTransactions.length} transactions
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions - Enterprise Design */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Recent Transactions</CardTitle>
                  <CardDescription className="text-[11px] mt-1">Latest internal usage activity</CardDescription>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Last 5 entries
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <BrandLoader size="md" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading transactions...</p>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No transactions yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Click "Dispatch Items" to create your first record
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {transaction.itemName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[11px] text-slate-900 dark:text-white truncate">{transaction.itemName}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="truncate">{transaction.department}</span>
                            <span className="text-slate-400 dark:text-slate-500">•</span>
                            <span className="flex-shrink-0">{format(new Date(transaction.timestamp), 'MMM dd, yyyy')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-bold text-[11px] text-slate-900 dark:text-white tabular-nums">{formatCurrency(transaction.totalCost)}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Qty: {transaction.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Channels Tab - Enterprise Design */}
        <TabsContent value="sales-channels" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Sales Channel Breakdown</CardTitle>
                <CardDescription className="text-[11px] mt-1">Cost distribution across sales channels</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <BrandLoader size="md" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading channel data...</p>
                  </div>
                </div>
              ) : Object.keys(salesChannelData).length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No sales channel data available</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Dispatch items to demo or internal use to see channel breakdown
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(salesChannelData)
                    .sort(([, a], [, b]) => b.cost - a.cost)
                    .map(([channel, data]) => (
                      <div key={channel} className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[11px] text-slate-900 dark:text-white">{channel}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-white tabular-nums">{formatCurrency(data.cost)}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">
                              ({((data.cost / totalCost) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(data.cost / totalCost) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab - Enterprise Design */}
        <TabsContent value="cost-analysis" className="space-y-6">
          {/* Cost Cards Grid */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="border-amber-200 dark:border-amber-800 shadow-sm bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Demo/Display Cost
                  </CardTitle>
                  <Monitor className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums mb-2">
                  {formatCurrency(demoCost)}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-amber-600 dark:text-amber-500">
                    {((demoCost / totalCost) * 100 || 0).toFixed(1)}% of total
                  </span>
                  <span className="text-amber-600 dark:text-amber-500 font-medium">
                    {demoTransactions.length} txns
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 shadow-sm bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Internal Use Cost
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums mb-2">
                  {formatCurrency(internalCost)}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-blue-600 dark:text-blue-500">
                    {((internalCost / totalCost) * 100 || 0).toFixed(1)}% of total
                  </span>
                  <span className="text-blue-600 dark:text-blue-500 font-medium">
                    {internalTransactions.length} txns
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 dark:border-indigo-800 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    Transfer Cost
                  </CardTitle>
                  <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums mb-2">
                  {formatCurrency(transferCost)}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-indigo-600 dark:text-indigo-500">
                    {((transferCost / totalCost) * 100 || 0).toFixed(1)}% of total
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-500 font-medium">
                    {transferTransactions.length} txns
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown Chart */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Cost Distribution by Type</CardTitle>
                <CardDescription className="text-[11px] mt-1">Visual breakdown of internal usage costs</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <BrandLoader size="md" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading cost analysis...</p>
                  </div>
                </div>
              ) : totalCost === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No cost data available</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Start dispatching items to see cost analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Demo/Display Bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Demo/Display</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {((demoCost / totalCost) * 100 || 0).toFixed(1)}%
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 tabular-nums min-w-[80px] text-right">
                          {formatCurrency(demoCost)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(demoCost / totalCost) * 100 || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Internal Use Bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Internal Use</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {((internalCost / totalCost) * 100 || 0).toFixed(1)}%
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 tabular-nums min-w-[80px] text-right">
                          {formatCurrency(internalCost)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(internalCost / totalCost) * 100 || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Warehouse Transfer Bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Warehouse Transfer</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {((transferCost / totalCost) * 100 || 0).toFixed(1)}%
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 tabular-nums min-w-[80px] text-right">
                          {formatCurrency(transferCost)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(transferCost / totalCost) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab - Enterprise Table Design */}
        <TabsContent value="transaction-history" className="space-y-6">
          {/* Filters and Search */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by item, department, or staff..."
                    value={searchTable}
                    onChange={(e) => setSearchTable(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="demo">Demo/Display</SelectItem>
                    <SelectItem value="internal">Internal Use</SelectItem>
                    <SelectItem value="transfer">Warehouse Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table - Enterprise Grade */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <BrandLoader size="lg" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading transaction history...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-b border-slate-700 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-900">
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Date</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Item</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Type</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Department</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3 text-center">Qty</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3 text-right">Cost</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Staff</TableHead>
                        <TableHead className="text-[10px] font-semibold text-white uppercase tracking-wider py-3">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No internal usage records found</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                              {searchTable || filterType !== "all" 
                                ? "Try adjusting your filters" 
                                : "Click \"Dispatch Items\" to create a new record"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow 
                            key={transaction.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-100 dark:border-slate-800"
                          >
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <div>
                                  <span className="text-[11px] font-medium text-slate-900 dark:text-white block">
                                    {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                                  </span>
                                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                    {format(new Date(transaction.timestamp), 'hh:mm a')}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="text-[11px] font-semibold text-slate-900 dark:text-white">
                                {transaction.itemName}
                              </span>
                            </TableCell>
                            <TableCell className="py-2">
                              {transaction.transactionType === 'demo' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  <Monitor className="h-2.5 w-2.5" />
                                  Demo
                                </span>
                              )}
                              {transaction.transactionType === 'internal' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  <Users className="h-2.5 w-2.5" />
                                  Internal
                                </span>
                              )}
                              {transaction.transactionType === 'transfer' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  <Package className="h-2.5 w-2.5" />
                                  Transfer
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <span className="text-[11px] text-slate-700 dark:text-slate-300">
                                {transaction.department || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 tabular-nums">
                                {transaction.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white tabular-nums">
                                {formatCurrency(transaction.totalCost)}
                              </span>
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                                  {transaction.staffName ? transaction.staffName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                  {transaction.staffName || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              {transaction.notes ? (
                                <div className="flex items-start gap-1.5 max-w-xs">
                                  <FileText className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {transaction.notes}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Transaction Count Footer */}
              {!loading && filteredTransactions.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredTransactions.length}</span> {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispatch Modal */}
      <Dialog open={dispatchModalOpen} onOpenChange={setDispatchModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">Dispatch Items</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Left: Dispatch Form */}
            <div className="space-y-4">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Dispatch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Purpose */}
                  <div>
                    <Label className="text-sm font-medium">Purpose *</Label>
                    <Select value={purpose} onValueChange={(value) => {
                      setPurpose(value)
                      if (value === 'Warehouse Transfer') {
                        setSalesChannel('')
                      }
                    }}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Demo/Display">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-purple-600" />
                            <span>Demo/Display</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Internal Use">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span>Internal Use</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Warehouse Transfer">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-indigo-600" />
                            <span>Warehouse Transfer</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sales Channel */}
                  {(purpose === 'Demo/Display' || purpose === 'Internal Use') && (
                    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <Label className="text-sm font-medium">
                        Sales Channel * <span className="text-xs text-slate-500">(Where will this be used?)</span>
                      </Label>
                      <Select value={salesChannel} onValueChange={setSalesChannel}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select sales channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facebook">📘 Facebook Store</SelectItem>
                          <SelectItem value="TikTok">🎵 TikTok Shop</SelectItem>
                          <SelectItem value="Lazada">🛒 Lazada</SelectItem>
                          <SelectItem value="Shopee">🛍️ Shopee</SelectItem>
                          <SelectItem value="Physical Store">🏪 Physical Store</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label className="text-sm font-medium">Notes (Optional)</Label>
                    <Input
                      placeholder="Purpose or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  {/* Dispatched By */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dispatched By *</Label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {staffName ? staffName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {staffName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Currently logged in</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 px-2 py-1 rounded bg-blue-100 dark:bg-blue-800">
                        Verified
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Summary */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Cart</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      ₱{cartTotal.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No items in cart</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {cart.map((cartItem) => (
                        <div
                          key={cartItem.item.id}
                          className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-slate-900 dark:text-white truncate">
                              {cartItem.item.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ₱{cartItem.item.costPrice.toFixed(2)} × {cartItem.quantity}
                            </p>
                          </div>
                          <Input
                            type="number"
                            min="1"
                            max={cartItem.item.quantity}
                            value={cartItem.quantity}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') return
                              const numValue = parseInt(value, 10)
                              if (!isNaN(numValue) && numValue >= 1) {
                                updateQuantity(cartItem.item.id, numValue)
                              }
                            }}
                            className="w-16 h-7 text-xs text-center"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(cartItem.item.id)}
                            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <p className="font-semibold text-xs text-purple-600 dark:text-purple-400 min-w-[60px] text-right">
                            ₱{(cartItem.item.costPrice * cartItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Products */}
            <div>
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <CardTitle className="text-base font-semibold">
                      Products ({filteredProducts.length})
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchProducts}
                        onChange={(e) => setSearchProducts(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {filteredProducts.map((item) => {
                      const isOutOfStock = item.quantity === 0
                      return (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          disabled={isOutOfStock}
                          className={cn(
                            "text-left border rounded-lg p-3 transition-all duration-200",
                            isOutOfStock
                              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 opacity-60 cursor-not-allowed"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer active:scale-95"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 flex-1">
                              {item.name}
                            </h4>
                            <span className={cn(
                              "px-1.5 py-0.5 text-[10px] font-bold rounded",
                              isOutOfStock
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            )}>
                              {isOutOfStock ? "OUT" : item.quantity}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            ₱{item.costPrice.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {item.category}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No products found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDispatchModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={loading || cart.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? "Processing..." : `Dispatch ${cart.length > 0 ? `(${cart.length} items)` : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Items Dispatched Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-center text-green-800 dark:text-green-200 font-medium mb-2">
                Internal Usage Recorded
              </p>
              <p className="text-center text-sm text-green-700 dark:text-green-300">
                Dispatch ID: <span className="font-mono font-bold">{dispatchId}</span>
              </p>
            </div>

            {dispatchedItems.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Dispatched Items</h4>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-48 overflow-y-auto">
                  {dispatchedItems.map((item, index) => (
                    <div key={index} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white ml-4">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(dispatchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>✓ Inventory has been updated</p>
              <p>✓ Transaction logged successfully</p>
              <p>✓ Staff: {staffName}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessModalOpen(false)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
