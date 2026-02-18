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
import { Search, Pencil, Trash2, PackagePlus, XCircle, Package, DollarSign, CheckCircle2, X, ArrowUpDown, AlertTriangle } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"

export default function OutOfStockPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [stockRoomFilter, setStockRoomFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)
  const [restockReason, setRestockReason] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    let filtered = items.filter((item) => item.quantity === 0)

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

    // Apply sorting
    if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.sellingPrice - a.sellingPrice)
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.sellingPrice - b.sellingPrice)
    }

    setFilteredItems(filtered)
  }, [search, categoryFilter, priceFilter, stockRoomFilter, sortBy, items])

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
    } catch (error) {
      console.error("[Out of Stock] Error fetching items:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await apiDelete(`/api/items/${id}`)
      fetchItems()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  function handleEdit(item: InventoryItem) {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  function handleRestock(item: InventoryItem) {
    setSelectedRestockItem(item)
    const suggestedAmount = Math.max(item.reorderLevel * 2, 10)
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
    setSortBy("name-asc")
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading out of stock items...</div>
      </div>
    )
  }

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

  const outOfStockItems = items.filter((item) => item.quantity === 0)
  const totalLostRevenue = outOfStockItems.reduce((sum, item) => sum + (item.sellingPrice * item.reorderLevel), 0)
  const highValueItems = outOfStockItems.filter(item => item.sellingPrice >= 500).length

  const activeFiltersCount = [
    categoryFilter !== "all",
    priceFilter !== "all",
    stockRoomFilter !== "all",
    search !== ""
  ].filter(Boolean).length

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Out of Stock Items
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Items that are completely out of stock and need immediate restocking
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {outOfStockItems.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Out of Stock</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {highValueItems}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">High Value Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(totalLostRevenue)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Potential Lost Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Row 1: Search + Export Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Row 2: Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-8 text-xs">
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
                <SelectTrigger className="h-8 text-xs">
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
                <SelectTrigger className="h-8 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Active Filters + Results */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 ? (
                  <>
                    <span className="text-slate-600 dark:text-slate-400">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-500">No filters applied</span>
                )}
              </div>
              <span className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{filteredItems.length}</span> of {outOfStockItems.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-[5px] bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
              <XCircle className="h-5 w-5" />
            </div>
            Out of Stock Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Out of Stock Items!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {search || categoryFilter !== "all" || priceFilter !== "all" || stockRoomFilter !== "all"
                  ? "No items match your current filters"
                  : "Excellent! All your inventory items are in stock."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: getCurrentUser()?.role === 'admin' ? '12%' : '24%' }} />
                  {getCurrentUser()?.role === 'admin' && <col style={{ width: '12%' }} />}
                </colgroup>
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Reorder At</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                    <th className="py-2.5 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Price</th>
                    {getCurrentUser()?.role === 'admin' && (
                      <th className="py-2.5 px-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[5px] flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30">
                              <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={item.name}>
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 text-[10px] px-1.5 py-0.5">
                                  OUT OF STOCK
                                </Badge>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  Room: {item.storageRoom || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="text-xs text-slate-600 dark:text-slate-400 block truncate" title={item.category}>
                            {item.category}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">
                            {formatNumber(item.reorderLevel)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">
                            {formatCurrency(item.costPrice)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                            {formatCurrency(item.sellingPrice)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          {getCurrentUser()?.role === 'admin' && (
                            <TooltipProvider>
                              <div className="flex justify-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRestock(item)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 h-7 w-7 p-0"
                                    >
                                      <PackagePlus className="h-3.5 w-3.5" />
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
                                      onClick={() => handleEdit(item)}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 h-7 w-7 p-0"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
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
                                      onClick={() => handleDelete(item.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 h-7 w-7 p-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
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
                This item is currently out of stock. Reorder level: {selectedRestockItem.reorderLevel}
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
                  Suggested: {Math.max(selectedRestockItem.reorderLevel * 2, 10)} units
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
    </div>
  )
}
