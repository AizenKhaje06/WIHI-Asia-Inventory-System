"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, PackagePlus, Package, Filter, X, ArrowUpDown, AlertCircle, TrendingUp, Warehouse, Tag, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { formatNumber, formatCurrency, cn } from "@/lib/utils"
import { showSuccess, showError } from "@/lib/toast-utils"
import type { StorageRoom } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { apiGet, apiDelete, apiPost, apiPut } from "@/lib/api-client"

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
  
  // Category Management
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{id: string, name: string, createdAt: string}>>([])
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  
  // Warehouse Management
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false)
  const [warehouses, setWarehouses] = useState<StorageRoom[]>([])
  const [newWarehouse, setNewWarehouse] = useState("")
  const [editingWarehouse, setEditingWarehouse] = useState<StorageRoom | null>(null)
  const [editWarehouseValue, setEditWarehouseValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Resizable columns state
  const [columnWidths, setColumnWidths] = useState({
    product: 220,
    category: 180,
    status: 90,
    stock: 100,
    storage: 120,
    cost: 100,
    price: 100,
    margin: 90,
    actions: 140
  })
  const [resizing, setResizing] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  
  // Delete confirmation modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])
  
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
    fetchWarehouses()
    fetchCategories()

    // Refresh data when window regains focus (e.g., after switching tabs)
    const handleFocus = () => {
      fetchItems()
      fetchWarehouses()
      fetchCategories()
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
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
      setFilteredItems(itemsArray)
    } catch (error) {
      console.error("[Inventory] Error fetching items:", error)
      setItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchWarehouses() {
    try {
      const data = await apiGet<StorageRoom[]>("/api/storage-rooms")
      setWarehouses(data)
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  async function fetchCategories() {
    try {
      const data = await apiGet<any[]>("/api/categories")
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" })
      fetchItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      showSuccess("Product deleted successfully")
    } catch (error) {
      console.error("[v0] Error deleting item:", error)
      showError("Failed to delete product")
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
    setRestockAmount(0)
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
      showSuccess("Item restocked successfully!")
    } catch (error) {
      console.error("[Inventory] Error restocking item:", error)
      showError("Failed to restock item")
    }
  }

  // Warehouse Management Functions
  async function handleAddWarehouse() {
    if (!newWarehouse.trim()) {
      showError("Please enter a warehouse name")
      return
    }

    try {
      setSubmitting(true)
      await apiPost("/api/storage-rooms", { name: newWarehouse.trim() })
      showSuccess("Warehouse added successfully")
      setNewWarehouse("")
      fetchWarehouses()
    } catch (error) {
      console.error("Error adding warehouse:", error)
      showError("Failed to add warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditWarehouse() {
    if (!editingWarehouse || !editWarehouseValue.trim()) {
      showError("Please enter a warehouse name")
      return
    }

    try {
      setSubmitting(true)
      await apiPut(`/api/storage-rooms/${editingWarehouse.id}`, { name: editWarehouseValue.trim() })
      showSuccess("Warehouse updated successfully")
      setEditingWarehouse(null)
      setEditWarehouseValue("")
      fetchWarehouses()
    } catch (error) {
      console.error("Error updating warehouse:", error)
      showError("Failed to update warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteWarehouse(id: string) {
    try {
      setSubmitting(true)
      await apiDelete(`/api/storage-rooms/${id}`)
      showSuccess("Warehouse deleted successfully")
      setDeleteWarehouseId(null)
      fetchWarehouses()
    } catch (error) {
      console.error("Error deleting warehouse:", error)
      showError("Failed to delete warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  // Category Management Functions
  async function handleAddCategory() {
    if (!newCategory.trim()) {
      showError("Please enter a category name")
      return
    }

    try {
      setSubmitting(true)
      const category = await apiPost("/api/categories", { name: newCategory.trim() })
      showSuccess("Category added successfully")
      setNewCategory("")
      fetchCategories()
    } catch (error) {
      console.error("Error adding category:", error)
      showError("Failed to add category")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditCategory() {
    if (!editingCategory || !editCategoryValue.trim()) {
      showError("Please enter a category name")
      return
    }

    try {
      setSubmitting(true)
      await apiPut(`/api/categories/${editingCategory.id}`, { name: editCategoryValue.trim() })
      showSuccess("Category updated successfully")
      setEditingCategory(null)
      setEditCategoryValue("")
      fetchCategories()
    } catch (error) {
      console.error("Error updating category:", error)
      showError("Failed to update category")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      setSubmitting(true)
      await apiDelete(`/api/categories/${id}`)
      showSuccess("Category deleted successfully")
      setDeleteCategoryId(null)
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      showError("Failed to delete category")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <PremiumTableLoading />
  }

  // Extract unique category names for filter
  const categoryNames = categories.map(cat => cat.name)

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-4 pb-6 px-0 md:pt-6 md:px-0">
      {/* Page Header - Mobile Optimized */}
      <div className="mb-5 px-4">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
          Inventory Management
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Comprehensive product inventory control and management
        </p>
      </div>

      {/* Action Buttons - Mobile Optimized */}
      {getCurrentUser()?.role === 'admin' && (
        <div className="mb-4 px-4 flex flex-wrap gap-2">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="flex-1 min-w-[140px] h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button
            onClick={() => setCategoryDialogOpen(true)}
            className="flex-1 min-w-[120px] h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button
            onClick={() => setWarehouseDialogOpen(true)}
            className="flex-1 min-w-[110px] h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            <Warehouse className="h-4 w-4 mr-2" />
            Storage
          </Button>
        </div>
      )}

      <div className="px-4">
      <Card className="mb-4 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          {/* Compact Filter Layout */}
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryNames.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                  <SelectValue placeholder="Storage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Storage</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.name}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
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
                <SelectTrigger className="h-11 text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="Sort by" />
                  </div>
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
                <span className="font-semibold">{items.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-none md:rounded-lg md:mx-4 overflow-hidden">
        <CardHeader className="pb-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-4 px-4 md:px-6">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span>Product Inventory</span>
              </CardTitle>
              <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 border-0 text-sm px-3 py-1.5 font-bold shadow-sm">
                {filteredItems.length} items
              </Badge>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">Total Value</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(Array.isArray(filteredItems) ? filteredItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0) : 0)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wide">Avg Price</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(Array.isArray(filteredItems) && filteredItems.length > 0 ? filteredItems.reduce((sum, item) => sum + item.sellingPrice, 0) / filteredItems.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!Array.isArray(filteredItems) || filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                <Package className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {search || categoryFilter !== "all" || priceFilter !== "all" || stockRoomFilter !== "all" || stockStatusFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first product"}
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Scroll Hint - Enhanced */}
              <div className="md:hidden px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 font-medium">
                  <span className="text-blue-500">←</span>
                  <span>Swipe to see all columns • Tap row to highlight</span>
                  <span className="text-blue-500">→</span>
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
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.status }}>
                        Status
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'status')}
                        />
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.stock }}>
                        Stock
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'stock')}
                        />
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.storage }}>
                        Storage
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'storage')}
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
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider relative" style={{ width: columnWidths.margin }}>
                        Margin
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'margin')}
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
                      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0
                      const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
                      const isOutOfStock = item.quantity === 0
                      const stockPercentage = Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100)
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
                          {/* Product Name */}
                          <td className="py-3 px-4" style={{ width: columnWidths.product }}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p 
                                  className={cn(
                                    "text-xs font-semibold break-words",
                                    isSelected 
                                      ? "text-blue-900 dark:text-blue-100" 
                                      : "text-slate-900 dark:text-white"
                                  )}
                                  title={item.name}
                                >
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {item.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4" style={{ width: columnWidths.category }}>
                            <span 
                              className={cn(
                                "text-xs block break-words",
                                isSelected 
                                  ? "text-blue-900 dark:text-blue-100 font-medium" 
                                  : "text-slate-600 dark:text-slate-400"
                              )}
                              title={item.category}
                            >
                              {item.category}
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.status }}>
                            <div className="flex justify-center">
                              {isOutOfStock ? (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 text-xs px-1.5 py-0.5">
                                  Out
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs px-1.5 py-0.5">
                                  Low
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-xs px-1.5 py-0.5">
                                  OK
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Stock with Progress */}
                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.stock }}>
                            <div className="flex flex-col items-end gap-1">
                              <span className={
                                isSelected 
                                  ? "text-xs font-bold tabular-nums text-blue-900 dark:text-blue-100" 
                                  : "text-xs font-bold tabular-nums text-slate-900 dark:text-white"
                              }>
                                {formatNumber(item.quantity)}
                              </span>
                              <div className="w-full max-w-[60px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
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
                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.storage }}>
                            <div className="flex justify-center">
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                {item.storageRoom || 'N/A'}
                              </Badge>
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-3 px-4 text-right whitespace-nowrap" style={{ width: columnWidths.cost }}>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                              {formatCurrency(item.costPrice)}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 text-right whitespace-nowrap" style={{ width: columnWidths.price }}>
                            <span className={
                              isSelected 
                                ? "text-xs font-semibold tabular-nums text-blue-900 dark:text-blue-100" 
                                : "text-xs font-semibold tabular-nums text-slate-900 dark:text-white"
                            }>
                              {formatCurrency(item.sellingPrice)}
                            </span>
                          </td>

                          {/* Profit Margin */}
                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.margin }}>
                            <div className="flex items-center justify-end gap-1">
                              <span className={`text-xs font-bold tabular-nums ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                                {profitMargin.toFixed(1)}%
                              </span>
                            </div>
                          </td>

                          {/* Actions - Admin only */}
                          <td className="py-3 px-4 whitespace-nowrap" style={{ width: columnWidths.actions }}>
                            {getCurrentUser()?.role === 'admin' && (
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
                            )}
                          </td>
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
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Restock {selectedRestockItem.name}</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Enter the amount to add to the current stock of {selectedRestockItem.quantity}.
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
              </div>
              <div>
                <Label htmlFor="restock-reason" className="text-slate-700 dark:text-slate-300 font-medium">Reason for Restock</Label>
                <Select value={restockReason} onValueChange={setRestockReason}>
                  <SelectTrigger id="restock-reason" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
              <Button type="button" variant="outline" onClick={() => setRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleRestockSubmit} disabled={restockAmount <= 0 || !restockReason} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Restock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Category Management Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-600" />
              Category Management
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Manage product categories
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {/* Add New Category */}
            <div className="flex gap-2 sticky top-0 bg-white dark:bg-slate-950 pb-2 z-10">
              <Input
                placeholder="Add new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCategory.trim()) {
                    handleAddCategory()
                  }
                }}
                className="h-10 text-sm rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                disabled={submitting}
              />
              <Button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || submitting}
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex-shrink-0"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Category List */}
            <div className="space-y-1.5">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditCategory()
                          }
                          if (e.key === "Escape") {
                            setEditingCategory(null)
                            setEditCategoryValue("")
                          }
                        }}
                        className="h-9 text-sm flex-1"
                        disabled={submitting}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleEditCategory}
                        disabled={submitting || !editCategoryValue.trim()}
                        className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white text-sm whitespace-nowrap"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null)
                          setEditCategoryValue("")
                        }}
                        disabled={submitting}
                        className="h-9 px-4 text-sm whitespace-nowrap"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Tag className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category)
                            setEditCategoryValue(category.name)
                          }}
                          disabled={submitting}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCategoryId(category.id)}
                          disabled={submitting}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warehouse Management Dialog */}
      <Dialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-orange-600" />
              Storage Management
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Manage storage locations
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {/* Add New Warehouse */}
            <div className="flex gap-2 sticky top-0 bg-white dark:bg-slate-950 pb-2 z-10">
              <Input
                placeholder="Add new storage room"
                value={newWarehouse}
                onChange={(e) => setNewWarehouse(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWarehouse()}
                disabled={submitting}
                className="h-10 text-sm rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <Button
                onClick={handleAddWarehouse}
                disabled={!newWarehouse.trim() || submitting}
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex-shrink-0"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Warehouse List */}
            {warehouses.length === 0 ? (
              <div className="text-center py-8">
                <Warehouse className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No storage rooms yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Add your first storage room</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                  >
                    {editingWarehouse?.id === warehouse.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editWarehouseValue}
                          onChange={(e) => setEditWarehouseValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditWarehouse()
                            if (e.key === "Escape") {
                              setEditingWarehouse(null)
                              setEditWarehouseValue("")
                            }
                          }}
                          disabled={submitting}
                          className="h-9 text-sm flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleEditWarehouse}
                          disabled={submitting || !editWarehouseValue.trim()}
                          className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white text-sm whitespace-nowrap"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWarehouse(null)
                            setEditWarehouseValue("")
                          }}
                          disabled={submitting}
                          className="h-9 px-4 text-sm whitespace-nowrap"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Warehouse className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{warehouse.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{warehouse.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingWarehouse(warehouse)
                              setEditWarehouseValue(warehouse.name)
                            }}
                            disabled={submitting}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteWarehouseId(warehouse.id)}
                            disabled={submitting}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Warehouse Confirmation */}
      <Dialog open={!!deleteWarehouseId} onOpenChange={() => setDeleteWarehouseId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Delete Warehouse</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this warehouse? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteWarehouseId(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteWarehouseId && handleDeleteWarehouse(deleteWarehouseId)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Delete Category</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryId(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
