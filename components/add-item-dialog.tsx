"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0,
    supplier: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      onSuccess()
      onOpenChange(false)
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        reorderLevel: 0,
        supplier: "",
      })
    } catch (error) {
      console.error("[v0] Error adding item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Name
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics & Gadgets">Electronics & Gadgets</SelectItem>
                  <SelectItem value="Fashion & Apparel">Fashion & Apparel</SelectItem>
                  <SelectItem value="Health, Beauty & Personal Care">Health, Beauty & Personal Care</SelectItem>
                  <SelectItem value="Home & Living">Home & Living</SelectItem>
                  <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="Baby, Kids & Toys">Baby, Kids & Toys</SelectItem>
                  <SelectItem value="Groceries & Pets">Groceries & Pets</SelectItem>
                  <SelectItem value="Automotive & Industrial">Automotive & Industrial</SelectItem>
                  <SelectItem value="Stationery & Books">Stationery & Books</SelectItem>
                  <SelectItem value="Other / Miscellaneous">Other / Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="text-foreground">
                Cost Price
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="text-foreground">
                Selling Price
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel" className="text-foreground">
                Reorder Level
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-foreground">
                Supplier
              </Label>
              <Input
                id="supplier"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
