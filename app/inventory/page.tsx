"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Pencil, Trash2, PackagePlus } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
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
    if (search) {
      const searchLower = search.toLowerCase()
      setFilteredItems(
        items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower),
        ),
      )
    } else {
      setFilteredItems(items)
    }
  }, [search, items])

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
        <div className="text-muted-foreground">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card className="mb-6 bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Cost</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-4 text-sm text-foreground">{item.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="py-4 text-sm text-muted-foreground">{item.category}</td>
                    <td className="py-4 text-right text-sm text-foreground">
                      <span className={item.quantity <= item.reorderLevel ? "text-warning" : ""}>{item.quantity}</span>
                    </td>
                    <td className="py-4 text-right text-sm text-foreground">₱{item.costPrice.toFixed(2)}</td>
                    <td className="py-4 text-right text-sm text-foreground">₱{item.sellingPrice.toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleRestock(item)}>
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
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
