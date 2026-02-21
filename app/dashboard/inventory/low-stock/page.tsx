"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Pencil, Trash2, PackagePlus, Filter, AlertTriangle, Package, TrendingDown, DollarSign, CheckCircle2, X, ArrowUpDown, AlertCircle } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"

export default function LowStockPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [stockRoomFilter, setStockRoomFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [sortBy, setSortBy] = useState("urgency-desc")
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)
  const [restockReason, setRestockReason] = useState("")
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  
  // Resizable columns state
  const [columnWidths, setColumnWidths] = useState({
    product: 220,
    category: 160,
    urgency: 100,
    current: 100,
    reorder: 90,
    cost: 100,
    price: 100,
    actions: 130
  })
  const [resizing, setResizing] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  
  // Delete confirmation modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null)

  // Handle column resize
  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    setResizing(column)
    setStartX(e.clientX)
    setStartWidth(columnWidths[column as keyof typeof columnWidths])
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return
      
      const diff = e.clientX - startX
      const newWidth = Math.max(80, startWidth + diff) // Minimum 80px
      
      setColumnWidths(prev => ({
        ...prev,
        [resizing]: newWidth
      }))
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing, startX, startWidth])

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    let filtered = items.filter((item) => item.quantity <= item.reorderLevel && item.quantity > 0)

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower),
      )
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (priceFilter && priceFilter !== "all") {
      if (priceFilter === "low") {
        filtered = filtered.filter((item) => item.sellingPrice < 100)
      } else if (priceFilter === "medium") {
        filtered = filtered.filter((item) => item.sellingPrice >= 100 && item.sellingPrice < 500)
      } else if (priceFilter === "high") {
        filtered = filtered.filter((item) => item.sellingPrice >= 500)
      }
    }

    if (stockRoomFilter && stockRoomFilter !== "all") {
      filtered = filtered.filter((item) => item.storageRoom === stockRoomFilter)
    }

    if (urgencyFilter && urgencyFilter !== "all") {
      filtered = filtered.filter((item) => {
        const urgency = getUrgencyLevel(item)
        return urgency === urgencyFilter
      })
    }

    // Apply sorting
    if (sortBy === "urgency-desc") {
      filtered.sort((a, b) => {
        const urgencyA = a.quantity / a.reorderLevel
        const urgencyB = b.quantity / b.reorderLevel
        return urgencyA - urgencyB
      })
    } else if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "quantity-asc") {
      filtered.sort((a, b) => a.quantity - b.quantity)
    }

    setFilteredItems(filtered)
  }, [search, categoryFilter, priceFilter, stockRoomFilter, urgencyFilter, sortBy, items])

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
    } catch (error) {
      console.error("[Low Stock] Error fetching items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function getUrgencyLevel(item: InventoryItem): "critical" | "low" {
    const percentage = (item.quantity / item.reorderLevel) * 100
    return percentage <= 25 ? "critical" : "low"
  }

  function getDaysUntilStockout(item: InventoryItem): string {
    // Simple estimation: if selling 1 per day
    if (item.quantity === 0) return "Out of stock"
    if (item.quantity <= 3) return `${item.quantity} days`
    return `${item.quantity} days`
  }

  async function handleDelete(id: string) {
    try {
      await apiDelete(`/api/items/${id}`)
      fetchItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }
  
  function openDeleteDialog(id: string, name: string) {
    setItemToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  function handleEdit(item: InventoryItem) {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  function handleRestock(item: InventoryItem) {
    setSelectedRestockItem(item)
    const suggestedAmount = Math.max(item.reorderLevel * 2 - item.quantity, 0)
    setRestockAmount(suggestedAmount)
    setRestockReason("")
    setRestockDialogOpen(true)
  }

  async function handleRestockSubmit() {
    if (!selectedRestockItem || restockAmount <= 0 || !restockReason) return

    try {
      await apiPost(`/api/items/${selectedRestockItem.id}/restock`, { 
        amount: restockAmount, 
        reason: restockReason 
      })

      setRestockDialogOpen(false)
      setSelectedRestockItem(null)
      setRestockReason("")
      fetchItems()
      alert("Item restocked successfully!")
    } catch (error) {
      console.error("Error restocking item:", error)
      alert("Failed to restock item")
    }
  }

  function clearAllFilters() {
    setSearch("")
    setCategoryFilter("all")
    setPriceFilter("all")
    setStockRoomFilter("all")
    setUrgencyFilter("all")
    setSortBy("urgency-desc")
  }

  // Define constants
  const categories = [
    "Electronics & Gadgets",
    "Fashion & Apparel",
    "Health, Beauty & Personal Care",
    "Home & Living",
    "Sports & Outdoors",
    "Baby, Kids & Toys",
    "Groceries & Pets",
    "Automotive & Industrial",
    "Stationery & Books",
    "Other / Miscellaneous",
  ]

  const lowStockItems = items.filter((item) => item.quantity <= item.reorderLevel && item.quantity > 0)
  const criticalItems = lowStockItems.filter(item => {
    const percentage = (item.quantity / item.reorderLevel) * 100
    return percentage <= 25
  })
  const totalValueAtRisk = lowStockItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

  const activeFiltersCount = [
    categoryFilter !== "all",
    priceFilter !== "all",
    stockRoomFilter !== "all",
    urgencyFilter !== "all",
    search !== ""
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading low stock items...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-4 pb-6 px-0 md:pt-6 md:px-0">
      <div className="mb-5 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Low Stock Alert
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Items that need immediate attention and restocking
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-4 px-4">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {lowStockItems.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Low Stock Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {criticalItems.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Critical Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(totalValueAtRisk)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Value at Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="px-4">
      <Card className="mb-4 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 text-sm border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>

            {/* Filters Grid - 2 columns on mobile, 5 columns on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                  <SelectItem value="low">🟡 Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Low (&lt; ₱100)</SelectItem>
                  <SelectItem value="medium">Medium (₱100-₱499)</SelectItem>
                  <SelectItem value="high">High (≥ ₱500)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockRoomFilter} onValueChange={setStockRoomFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="A">Room A</SelectItem>
                  <SelectItem value="B">Room B</SelectItem>
                  <SelectItem value="C">Room C</SelectItem>
                  <SelectItem value="D">Room D</SelectItem>
                  <SelectItem value="E">Room E</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency-desc">Most Urgent</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="quantity-asc">Lowest Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters + Results - Enhanced */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 ? (
                  <>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs px-2.5 py-1 font-medium">
                      {activeFiltersCount} active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Clear all
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">No filters</span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span>
                <span className="mx-1 text-slate-400">of</span>
                <span className="font-semibold">{lowStockItems.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-none md:rounded-lg md:mx-4 overflow-hidden">
        <CardHeader className="pb-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-4 px-4 md:px-6">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <span>Low Stock Items</span>
              </CardTitle>
              <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 border-0 text-sm px-3 py-1.5 font-bold shadow-sm">
                {filteredItems.length} items
              </Badge>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-100 dark:border-red-800">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Critical Items</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {criticalItems.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Value at Risk</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(totalValueAtRisk)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">All Items Well Stocked!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {search || categoryFilter !== "all" || priceFilter !== "all" || stockRoomFilter !== "all" || urgencyFilter !== "all"
                  ? "No items match your current filters"
                  : "Great job! All your inventory items are above their reorder levels."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Scroll Hint - Enhanced */}
              <div className="md:hidden px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-100 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2 font-medium">
                  <span className="text-amber-500">←</span>
                  <span>Swipe to see all columns • Tap row to highlight</span>
                  <span className="text-amber-500">→</span>
                </p>
              </div>

              {/* Desktop Resize Hint */}
              <div className="hidden md:block px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 font-medium">
                  <span>💡</span>
                  <span>Drag column borders to resize • Expand Product column to see full names</span>
                </p>
              </div>

              <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}>
                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.product }}>
                      Product
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'product')}
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.category }}>
                      Category
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'category')}
                      />
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.urgency }}>
                      Urgency
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'urgency')}
                      />
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.current }}>
                      Current
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'current')}
                      />
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.reorder }}>
                      Reorder
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'reorder')}
                      />
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.cost }}>
                      Cost
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'cost')}
                      />
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.price }}>
                      Price
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'price')}
                      />
                    </th>
                    {getCurrentUser()?.role === 'admin' && (
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider" style={{ width: columnWidths.actions }}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredItems.map((item) => {
                      const urgency = getUrgencyLevel(item)
                      const stockPercentage = (item.quantity / item.reorderLevel) * 100
                      const isSelected = selectedRowId === item.id
                      
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedRowId(isSelected ? null : item.id)}
                          className={
                            isSelected
                              ? "transition-all duration-200 cursor-pointer bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400 ring-inset"
                              : "transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          }
                        >
                          <td className="py-3 px-4" style={{ width: columnWidths.product }}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                urgency === "critical" 
                                  ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
                                  : "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30"
                              )}>
                                <Package className={cn(
                                  "h-4 w-4",
                                  urgency === "critical" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                                )} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  "text-xs font-semibold break-words",
                                  isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white"
                                )} title={item.name}>
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.storageRoom || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4" style={{ width: columnWidths.category }}>
                            <span className={cn(
                              "text-xs block break-words",
                              isSelected ? "text-blue-900 dark:text-blue-100 font-medium" : "text-slate-600 dark:text-slate-400"
                            )} title={item.category}>
                              {item.category}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.urgency }}>
                            <div className="flex justify-center">
                              {urgency === "critical" ? (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 text-xs px-1.5 py-0.5">
                                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                                  Critical
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs px-1.5 py-0.5">
                                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                                  Low
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.current }}>
                            <div className="flex flex-col items-end gap-1">
                              <span className={cn(
                                "text-xs font-bold tabular-nums",
                                urgency === "critical" ? "text-red-600" : "text-amber-600"
                              )}>
                                {formatNumber(item.quantity)}
                              </span>
                              <div className="w-full max-w-[60px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-300",
                                    urgency === "critical" ? "bg-red-500" : "bg-amber-500"
                                  )}
                                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap" style={{ width: columnWidths.reorder }}>
                            <span className={cn(
                              "text-xs font-medium tabular-nums",
                              isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"
                            )}>
                              {formatNumber(item.reorderLevel)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap" style={{ width: columnWidths.cost }}>
                            <span className={cn(
                              "text-xs font-medium tabular-nums",
                              isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"
                            )}>
                              {formatCurrency(item.costPrice)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap" style={{ width: columnWidths.price }}>
                            <span className={cn(
                              "text-xs font-semibold tabular-nums",
                              isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white"
                            )}>
                              {formatCurrency(item.sellingPrice)}
                            </span>
                          </td>

                          {getCurrentUser()?.role === 'admin' && (
                            <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.actions }}>
                              <TooltipProvider>
                                <div className="flex justify-center gap-0.5">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRestock(item)
                                        }}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-9 w-9 p-0"
                                      >
                                        <PackagePlus className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Restock</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEdit(item)
                                        }}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9 w-9 p-0"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openDeleteDialog(item.id, item.name)
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9 p-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <EditItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
          onSuccess={fetchItems}
        />
      )}

      {selectedRestockItem && (
        <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Restock {selectedRestockItem.name}</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Current stock: {selectedRestockItem.quantity} | Reorder level: {selectedRestockItem.reorderLevel}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="restock-amount" className="text-slate-700 dark:text-slate-300 font-medium">Amount to Restock</Label>
                <Input
                  id="restock-amount"
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Suggested: {Math.max(selectedRestockItem.reorderLevel * 2 - selectedRestockItem.quantity, 0)} units
                </p>
              </div>
              <div>
                <Label htmlFor="restock-reason" className="text-slate-700 dark:text-slate-300 font-medium">Reason for Restock</Label>
                <Select value={restockReason} onValueChange={setRestockReason}>
                  <SelectTrigger id="restock-reason" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="new-stock">New Stock Arrival</SelectItem>
                    <SelectItem value="low-stock-alert">Low Stock Alert</SelectItem>
                    <SelectItem value="damaged-return">Damaged Item Return</SelectItem>
                    <SelectItem value="supplier-return">Supplier Return</SelectItem>
                    <SelectItem value="inventory-adjustment">Inventory Adjustment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setRestockDialogOpen(false)}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleRestockSubmit} 
                disabled={restockAmount <= 0 || !restockReason}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Restock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Enterprise-Grade Delete Product Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-600 dark:text-slate-400 space-y-3 py-4">
            <div className="font-medium">Are you sure you want to delete this product?</div>
            {itemToDelete && (
              <div className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg font-mono">
                {itemToDelete.name}
              </div>
            )}
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ This action cannot be undone
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              className="w-40 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => itemToDelete && handleDelete(itemToDelete.id)}
              className="w-40 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
