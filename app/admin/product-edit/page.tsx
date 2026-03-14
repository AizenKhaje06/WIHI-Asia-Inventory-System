"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, PackagePlus } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { cn } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { apiGet, apiPost, apiDelete } from "@/lib/api-client"

export default function ProductEditPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)

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
          item.sku.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower),
      )
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [search, categoryFilter, items])

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
      setFilteredItems(itemsArray)
    } catch (error) {
      console.error("[Product Edit] Error fetching items:", error)
      setItems([])
      setFilteredItems([])
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
    setRestockDialogOpen(true)
  }

  async function handleRestockSubmit() {
    if (!selectedRestockItem || restockAmount <= 0) return

    try {
      await apiPost(`/api/items/${selectedRestockItem.id}/restock`, { amount: restockAmount })

      setRestockDialogOpen(false)
      setSelectedRestockItem(null)
      fetchItems()
      alert("Item restocked successfully!")
    } catch (error) {
      console.error("[v0] Error restocking item:", error)
      alert("Failed to restock item")
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading inventory...</div>
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Product Edit</h1>
        <p className="text-muted-foreground">Manage your product inventory</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, SKU, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[25%]">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[12%]">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[12%]">Sales Channel</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[12%]">Store</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[9%]">Margin</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground w-[25%]">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground w-[12%]">{item.category}</td>
                    <td className="px-4 py-3 text-center text-sm w-[10%]"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">OK</span></td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground w-[10%]">{item.quantity}</td>
                    <td className="px-4 py-3 text-center text-sm w-[12%]"><span className="inline-block px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-xs font-medium">Lazada</span></td>
                    <td className="px-4 py-3 text-center text-sm w-[12%]"><span className="inline-block px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-xs font-medium">Warehouse</span></td>
                    <td className="px-4 py-3 text-right text-sm text-foreground w-[10%]">₱{item.costPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm text-foreground w-[10%]">₱{item.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400 w-[9%]">{((((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100) || 0).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center w-[10%]">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleRestock(item)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 h-auto">
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1 h-auto">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto">
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
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleRestockSubmit} disabled={restockAmount <= 0}>
                Restock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
