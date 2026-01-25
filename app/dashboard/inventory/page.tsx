"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, PackagePlus, Package, Filter, X, ArrowUpDown, AlertCircle, TrendingUp, Warehouse } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { formatNumber, formatCurrency } from "@/lib/utils"

import { PremiumTableLoading } from "@/components/premium-loading"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [stockRoomFilter, setStockRoomFilter] = useState("all")
  const [stockStatusFilter, setStockStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)
  const [restockReason, setRestockReason] = useState("")

  useEffect(() => {
    fetchItems()

    // Refresh data when window regains focus (e.g., after switching tabs)
    const handleFocus = () => {
      fetchItems()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    let filtered = items

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

    if (stockStatusFilter && stockStatusFilter !== "all") {
      if (stockStatusFilter === "in-stock") {
        filtered = filtered.filter((item) => item.quantity > item.reorderLevel)
      } else if (stockStatusFilter === "low-stock") {
        filtered = filtered.filter((item) => item.quantity <= item.reorderLevel && item.quantity > 0)
      } else if (stockStatusFilter === "out-of-stock") {
        filtered = filtered.filter((item) => item.quantity === 0)
      }
    }

    // Apply sorting
    if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.sellingPrice - b.sellingPrice)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.sellingPrice - a.sellingPrice)
    } else if (sortBy === "stock-asc") {
      filtered.sort((a, b) => a.quantity - b.quantity)
    } else if (sortBy === "stock-desc") {
      filtered.sort((a, b) => b.quantity - a.quantity)
    }

    setFilteredItems(filtered)
  }, [search, categoryFilter, priceFilter, stockRoomFilter, stockStatusFilter, sortBy, items])

  async function fetchItems() {
    try {
      const res = await fetch("/api/items")
      const data = await res.json()
      setItems(data)
      setFilteredItems(data)
    } catch (error) {
      console.error("[v0] Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" })
      fetchItems()
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
    }
  }

  function handleEdit(item: InventoryItem) {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  function handleRestock(item: InventoryItem) {
    setSelectedRestockItem(item)
    setRestockAmount(0)
    setRestockReason("")
    setRestockDialogOpen(true)
  }

  async function handleRestockSubmit() {
    if (!selectedRestockItem || restockAmount <= 0 || !restockReason) return

    try {
      const res = await fetch(`/api/items/${selectedRestockItem.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: restockAmount, reason: restockReason }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

      setRestockDialogOpen(false)
      setSelectedRestockItem(null)
      setRestockReason("")
      fetchItems()
      alert("Item restocked successfully!")
    } catch (error) {
      console.error("[v0] Error restocking item:", error)
      alert("Failed to restock item")
    }
  }

  if (loading) {
    return <PremiumTableLoading />
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

  const activeFiltersCount = [
    categoryFilter !== "all",
    priceFilter !== "all",
    stockRoomFilter !== "all",
    stockStatusFilter !== "all",
    search !== ""
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSearch("")
    setCategoryFilter("all")
    setPriceFilter("all")
    setStockRoomFilter("all")
    setStockStatusFilter("all")
    setSortBy("name-asc")
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          Inventory Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Comprehensive product inventory control and management
        </p>
      </div>

      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardContent className="p-4">
          {/* Compact Filter Layout */}
          <div className="space-y-3">
            {/* Row 1: Search + Add Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 border-slate-200 dark:border-slate-700"
                />
              </div>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-10 px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            {/* Row 2: Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-9 text-xs">
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
                <SelectTrigger className="h-9 text-xs">
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

              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="stock-asc">Stock (Low-High)</SelectItem>
                  <SelectItem value="stock-desc">Stock (High-Low)</SelectItem>
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
                <span className="font-semibold text-slate-900 dark:text-white">{filteredItems.length}</span> of {items.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <Package className="h-5 w-5" />
              </div>
              Product Inventory ({filteredItems.length} items)
            </CardTitle>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Value</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(Array.isArray(filteredItems) ? filteredItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0) : 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Avg Price</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(Array.isArray(filteredItems) && filteredItems.length > 0 ? filteredItems.reduce((sum, item) => sum + item.sellingPrice, 0) / filteredItems.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!Array.isArray(filteredItems) || filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {search || categoryFilter !== "all" || priceFilter !== "all" || stockRoomFilter !== "all" || stockStatusFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first product"}
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="pb-3 pr-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[280px]">Product</th>
                      <th className="pb-3 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[180px]">Category</th>
                      <th className="pb-3 px-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[140px]">Stock Status</th>
                      <th className="pb-3 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[100px]">Stock</th>
                      <th className="pb-3 px-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[80px]">Room</th>
                      <th className="pb-3 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[100px]">Cost</th>
                      <th className="pb-3 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[100px]">Price</th>
                      <th className="pb-3 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[100px]">Margin</th>
                      <th className="pb-3 pl-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0
                      const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
                      const isOutOfStock = item.quantity === 0
                      const stockPercentage = Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100)
                      
                      return (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                          {/* Product Name */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={item.name}>
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  SKU: {item.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400 block truncate" title={item.category}>
                              {item.category}
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-4 px-3">
                            <div className="flex justify-center">
                              {isOutOfStock ? (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 whitespace-nowrap">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Out of Stock
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 whitespace-nowrap">
                                  In Stock
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Stock with Progress */}
                          <td className="py-4 px-3">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatNumber(item.quantity)}
                              </span>
                              <div className="w-full max-w-[80px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    isOutOfStock ? 'bg-red-500' :
                                    isLowStock ? 'bg-amber-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Storage Room */}
                          <td className="py-4 px-3">
                            <div className="flex justify-center">
                              <Badge variant="outline" className="font-mono whitespace-nowrap">
                                <Warehouse className="h-3 w-3 mr-1" />
                                {item.storageRoom || 'N/A'}
                              </Badge>
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-4 px-3 text-right">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {formatCurrency(item.costPrice)}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-3 text-right">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {formatCurrency(item.sellingPrice)}
                            </span>
                          </td>

                          {/* Profit Margin */}
                          <td className="py-4 px-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <TrendingUp className={`h-3.5 w-3.5 flex-shrink-0 ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'}`} />
                              <span className={`text-sm font-bold whitespace-nowrap ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                                {profitMargin.toFixed(1)}%
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-3">
                            <TooltipProvider>
                              <div className="flex justify-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRestock(item)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 h-8 w-8 p-0"
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
                                      onClick={() => handleEdit(item)}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 h-8 w-8 p-0"
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
                                      onClick={() => handleDelete(item.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 h-8 w-8 p-0"
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddItemDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={fetchItems} />

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restock {selectedRestockItem.name}</DialogTitle>
              <DialogDescription>
                Enter the amount to add to the current stock of {selectedRestockItem.quantity}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="restock-amount">Amount to Restock</Label>
                <Input
                  id="restock-amount"
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="restock-reason">Reason for Restock</Label>
                <Select value={restockReason} onValueChange={setRestockReason}>
                  <SelectTrigger id="restock-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-stock">New Stock Arrival</SelectItem>
                    <SelectItem value="damaged-return">Damaged Item Return</SelectItem>
                    <SelectItem value="supplier-return">Supplier Return</SelectItem>
                    <SelectItem value="inventory-adjustment">Inventory Adjustment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleRestockSubmit} disabled={restockAmount <= 0 || !restockReason}>
                Restock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
