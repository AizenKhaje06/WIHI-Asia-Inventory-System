'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2, PackagePlus, Package, Filter, X, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { formatNumber, formatCurrency, cn } from "@/lib/utils"
import { showSuccess, showError } from "@/lib/toast-utils"
import { apiGet, apiDelete } from "@/lib/api-client"
import { BrandLoader } from '@/components/ui/brand-loader'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function LogisticsProductsPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    let filtered = items

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredItems(filtered)
  }, [search, items])

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
      setFilteredItems(itemsArray)
    } catch (error) {
      console.error("Error fetching items:", error)
      setItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const isBundle = id.startsWith('BUNDLE-')
      const endpoint = isBundle ? `/api/bundles/${id}` : `/api/items/${id}`
      
      const headers = new Headers({
        'Content-Type': 'application/json'
      })
      
      const username = localStorage.getItem('username')
      const role = localStorage.getItem('userRole')
      const displayName = localStorage.getItem('displayName')
      
      if (username) headers.set('x-user-username', username)
      if (role) headers.set('x-user-role', role)
      if (displayName) headers.set('x-user-display-name', displayName)
      
      const response = await fetch(endpoint, { 
        method: "DELETE",
        headers 
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete product' }))
        throw new Error(errorData.error || 'Failed to delete product')
      }
      
      await fetchItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      showSuccess("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting item:", error)
      showError(error instanceof Error ? error.message : "Failed to delete product")
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

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    } else if (item.quantity <= item.reorderLevel) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BrandLoader size="lg" />
            <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Package className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Products</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Manage inventory and product catalog</p>
            </div>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-1 p-5 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <Package className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">{items.length}</p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-1 p-5 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-600 shadow-lg shadow-green-500/30">
              <PackagePlus className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">In Stock</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 tabular-nums">
                {items.filter(i => i.quantity > i.reorderLevel).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-1 p-5 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-600 shadow-lg shadow-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 tabular-nums">
                {items.filter(i => i.quantity > 0 && i.quantity <= i.reorderLevel).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-1 p-5 border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 shadow-lg shadow-red-500/30">
              <X className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100 tabular-nums">
                {items.filter(i => i.quantity === 0).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Search Products</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, category, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{items.length}</span> products
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const status = getStockStatus(item)
          const profitMargin = item.sellingPrice > 0 
            ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100).toFixed(1)
            : '0.0'

          return (
            <Card key={item.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {item.name}
                    </CardTitle>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.category}</p>
                  </div>
                  <Badge className={cn("ml-2 font-semibold text-xs", status.color)}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Stock</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatNumber(item.quantity)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(item.sellingPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Cost: {formatCurrency(item.costPrice)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{profitMargin}% margin</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex-1 h-9 font-semibold border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(item.id, item.name)}
                    className="flex-1 h-9 font-semibold border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">No products found</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Try adjusting your search</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchItems}
      />

      {selectedItem && (
        <EditItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
          onSuccess={fetchItems}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
