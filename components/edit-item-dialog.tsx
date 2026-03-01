"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem, Store } from "@/lib/types"
import { apiGet, apiPut } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"

const SALES_CHANNELS = ['Shopee', 'Lazada', 'Facebook', 'TikTok', 'Physical Store'] as const

interface EditItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function EditItemDialog({ open, onOpenChange, item, onSuccess }: EditItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    salesChannel: item.salesChannel || "",
    store: item.store,
    quantity: item.quantity,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    reorderLevel: item.reorderLevel,
  })

  useEffect(() => {
    setFormData({
      name: item.name,
      category: item.category,
      salesChannel: item.salesChannel || "",
      store: item.store,
      quantity: item.quantity,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      reorderLevel: item.reorderLevel,
    })
  }, [item])

  useEffect(() => {
    if (open) {
      fetchStores()
      fetchCategories()
    }
  }, [open])

  async function fetchStores() {
    try {
      setLoadingStores(true)
      const data = await apiGet<Store[]>("/api/stores")
      setStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setLoadingStores(false)
    }
  }

  async function fetchCategories() {
    try {
      setLoadingCategories(true)
      const data = await apiGet<Array<{id: string, name: string}>>("/api/categories")
      setCategories(data)
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
      await apiPut(`/api/items/${item.id}`, formData)
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
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
              <Label htmlFor="edit-quantity" className="text-slate-700 dark:text-slate-300 font-medium">
                Quantity {!isAdmin && "(Read-only)"}
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                required
                value={formData.quantity}
                onChange={isAdmin ? (e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) }) : undefined}
                readOnly={!isAdmin}
                className={`rounded-[5px] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white ${
                  isAdmin 
                    ? "bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" 
                    : "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                }`}
              />
              {!isAdmin && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Use Restock to change quantity</p>
              )}
              {isAdmin && (
                <p className="text-xs text-orange-600 dark:text-orange-400">⚠️ Admin: Direct quantity edit enabled</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-salesChannel" className="text-slate-700 dark:text-slate-300 font-medium">
                Sales Channel
              </Label>
              <Select value={formData.salesChannel} onValueChange={(value) => setFormData({ ...formData, salesChannel: value, store: "" })} required>
                <SelectTrigger id="edit-salesChannel" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder="Select sales channel" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {SALES_CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-store" className="text-slate-700 dark:text-slate-300 font-medium">
                Store
              </Label>
              <Select 
                value={formData.store} 
                onValueChange={(value) => setFormData({ ...formData, store: value })} 
                required
                disabled={!formData.salesChannel}
              >
                <SelectTrigger id="edit-store" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder={!formData.salesChannel ? "Select sales channel first" : loadingStores ? "Loading stores..." : "Select a store"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {loadingStores ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : stores.filter(s => s.sales_channel === formData.salesChannel).length === 0 ? (
                    <SelectItem value="none" disabled>No stores available for this channel</SelectItem>
                  ) : (
                    stores
                      .filter(s => s.sales_channel === formData.salesChannel)
                      .map((store) => (
                        <SelectItem key={store.id} value={store.store_name}>
                          {store.store_name}
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
