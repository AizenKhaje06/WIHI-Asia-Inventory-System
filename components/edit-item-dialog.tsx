"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem, StorageRoom } from "@/lib/types"

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function EditItemDialog({ open, onOpenChange, item, onSuccess }: EditItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [storageRooms, setStorageRooms] = useState<StorageRoom[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    storageRoom: item.storageRoom,
    quantity: item.quantity,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    reorderLevel: item.reorderLevel,
  })

  useEffect(() => {
    setFormData({
      name: item.name,
      category: item.category,
      storageRoom: item.storageRoom,
      quantity: item.quantity,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      reorderLevel: item.reorderLevel,
    })
  }, [item])

  useEffect(() => {
    if (open) {
      fetchStorageRooms()
    }
  }, [open])

  async function fetchStorageRooms() {
    try {
      setLoadingRooms(true)
      const response = await fetch("/api/storage-rooms")
      if (response.ok) {
        const data = await response.json()
        setStorageRooms(data)
      }
    } catch (error) {
      console.error("Error fetching storage rooms:", error)
    } finally {
      setLoadingRooms(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error updating item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Edit Product</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Update product information and pricing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-slate-700 dark:text-slate-300 font-medium">
                Product Name
              </Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-slate-700 dark:text-slate-300 font-medium">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="edit-category" className="w-full rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
              <Label htmlFor="edit-quantity" className="text-slate-700 dark:text-slate-300 font-medium">
                Quantity (Read-only)
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                required
                value={formData.quantity}
                readOnly
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Use Restock to change quantity</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-storageRoom" className="text-slate-700 dark:text-slate-300 font-medium">
                Storage Room
              </Label>
              <Select value={formData.storageRoom} onValueChange={(value) => setFormData({ ...formData, storageRoom: value })} required>
                <SelectTrigger id="edit-storageRoom" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder={loadingRooms ? "Loading rooms..." : "Select a storage room"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {loadingRooms ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : storageRooms.length === 0 ? (
                    <SelectItem value="none" disabled>No rooms available</SelectItem>
                  ) : (
                    storageRooms.map((room) => (
                      <SelectItem key={room.id} value={room.name}>
                        {room.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice" className="text-slate-700 dark:text-slate-300 font-medium">
                Cost Price (₱)
              </Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) })}
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-sellingPrice" className="text-slate-700 dark:text-slate-300 font-medium">
                Selling Price (₱)
              </Label>
              <Input
                id="edit-sellingPrice"
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) })}
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-reorderLevel" className="text-slate-700 dark:text-slate-300 font-medium">
                Reorder Level
              </Label>
              <Input
                id="edit-reorderLevel"
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) })}
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
