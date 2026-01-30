"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StorageRoom } from "@/lib/types"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [storageRooms, setStorageRooms] = useState<StorageRoom[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    storageRoom: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0,
  })

  useEffect(() => {
    if (open) {
      fetchStorageRooms()
      fetchCategories()
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

  async function fetchCategories() {
    try {
      setLoadingCategories(true)
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoadingCategories(false)
    }
  }

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
        storageRoom: "",
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        reorderLevel: 0,
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
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                Name
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="category" className="w-full max-w-xs rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent className="w-full max-w-xs">
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-300 font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })}
                className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="text-slate-700 dark:text-slate-300 font-medium">
                Cost Price
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) })}
                className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="text-slate-700 dark:text-slate-300 font-medium">
                Selling Price
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) })}
                className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel" className="text-slate-700 dark:text-slate-300 font-medium">
                Reorder Level
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) })}
                className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageRoom" className="text-slate-700 dark:text-slate-300 font-medium">
                Storage Room
              </Label>
              <Select value={formData.storageRoom} onValueChange={(value) => setFormData({ ...formData, storageRoom: value })} required>
                <SelectTrigger id="storageRoom" className="rounded-xl border-2 border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={loadingRooms ? "Loading rooms..." : "Select a storage room"} />
                </SelectTrigger>
                <SelectContent>
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
