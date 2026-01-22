"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Pencil, Trash2, PackagePlus, Filter } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"

export default function OutOfStockPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [stockRoomFilter, setStockRoomFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)

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

    setFilteredItems(filtered)
  }, [search, categoryFilter, priceFilter, stockRoomFilter, items])

  async function fetchItems() {
    try {
      const res = await fetch("/api/items")
      const data = await res.json()
      setItems(data)
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
    setRestockDialogOpen(true)
  }

  async function handleRestockSubmit() {
    if (!selectedRestockItem || restockAmount <= 0) return

    try {
      const res = await fetch(`/api/items/${selectedRestockItem.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: restockAmount }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

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

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-full overflow-x-hidden">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-white mb-2">Out of Stock Items</h1>
        <p className="text-slate-400 text-lg">Items that are completely out of stock</p>
      </div>

      <Card className="mb-8 border-0 shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-slate-300 font-medium">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-48">
                <Label htmlFor="category-filter" className="text-slate-300 font-medium">Filter by Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter">
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
              <div className="w-48">
                <Label htmlFor="price-filter" className="text-slate-300 font-medium">Filter by Price</Label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger id="price-filter">
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
              <div className="w-48">
                <Label htmlFor="storage-room-filter" className="text-slate-300 font-medium">Filter by Storage Room</Label>
                <Select value={stockRoomFilter} onValueChange={setStockRoomFilter}>
                  <SelectTrigger id="storage-room-filter">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="All Storage Rooms" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Storage Rooms</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Out of Stock Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 text-left text-sm font-medium text-slate-400 whitespace-nowrap">Name</th>
                    <th className="pb-3 text-left text-sm font-medium text-slate-400 whitespace-nowrap">Category</th>
                    <th className="pb-3 text-right text-sm font-medium text-slate-400 whitespace-nowrap">Quantity</th>
                    <th className="pb-3 text-right text-sm font-medium text-slate-400 whitespace-nowrap">Cost</th>
                    <th className="pb-3 text-right text-sm font-medium text-slate-400 whitespace-nowrap">Price</th>
                    <th className="pb-3 text-right text-sm font-medium text-slate-400 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700 last:border-0 hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 text-sm text-white whitespace-nowrap max-w-[200px] truncate" title={item.name}>
                        {item.name}
                      </td>
                      <td className="py-4 text-sm text-slate-400 whitespace-nowrap max-w-[150px] truncate" title={item.category}>
                        {item.category}
                      </td>
                      <td className="py-4 text-right text-sm whitespace-nowrap">
                        <span className={cn("font-bold", item.quantity <= item.reorderLevel ? "text-orange-500" : "text-green-500")}>{item.quantity}</span>
                      </td>
                      <td className="py-4 text-right text-sm text-white whitespace-nowrap">₱{item.costPrice.toFixed(2)}</td>
                      <td className="py-4 text-right text-sm text-white whitespace-nowrap">₱{item.sellingPrice.toFixed(2)}</td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleRestock(item)} className="h-8 w-8 p-0">
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
