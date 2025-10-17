"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, PackagePlus, Package, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [stockRoomFilter, setStockRoomFilter] = useState("all")
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
      filtered = filtered.filter((item) => item.supplier === stockRoomFilter)
    }

    setFilteredItems(filtered)
  }, [search, categoryFilter, priceFilter, stockRoomFilter, items])

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
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="mb-8">
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex-shrink-0">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen dark:from-slate-900 dark:to-slate-800">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">
          Inventory Management
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Comprehensive product inventory control and management</p>
      </div>

      <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="search" className="text-slate-700 dark:text-slate-300 font-medium">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter" className="text-slate-700 dark:text-slate-300 font-medium">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price-filter" className="text-slate-700 dark:text-slate-300 font-medium">Filter by Price</Label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger id="price-filter" className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Prices" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Low ({"< PHP 100"})</SelectItem>
                  <SelectItem value="medium">Medium (PHP 100 - 499)</SelectItem>
                  <SelectItem value="high">High (≥ PHP 500)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-room-filter" className="text-slate-700 dark:text-slate-300 font-medium">Filter by Stock Room</Label>
              <Select value={stockRoomFilter} onValueChange={setStockRoomFilter}>
                <SelectTrigger id="stock-room-filter" className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="All Stock Rooms" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Rooms</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Package className="h-5 w-5" />
            </div>
            Product Inventory ({filteredItems.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 w-[25%]">Product Name</th>
                  <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 w-[12%]">Category</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 w-[6%]">Stock</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 w-[10%]">Total COGS</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 w-[10%]">Cost</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 w-[10%]">Price</th>
                  <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 w-[17%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200 w-[25%]">{item.name}</td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400 w-[12%]">{item.category}</td>
                    <td className="py-4 text-right text-sm w-[6%]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    </td>
                    <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 w-[10%]">₱{(item.totalCOGS ?? 0).toFixed(2)}</td>
                    <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 w-[10%]">₱{item.costPrice.toFixed(2)}</td>
                    <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 w-[10%]">₱{item.sellingPrice.toFixed(2)}</td>
                    <td className="py-4 text-right w-[17%]">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestock(item)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                        >
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
