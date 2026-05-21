"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Loader2 } from "lucide-react"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0,
    salesChannel: "Physical Store", // Default value for universal products
    store: "Main Store", // Default value for universal products
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

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
      // Products are now universal - no sales channel or store needed
      await apiPost("/api/items", formData)
      toast.success("Product added successfully!")
      onSuccess()
      onOpenChange(false)
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        reorderLevel: 0,
        salesChannel: "Physical Store",
        store: "Main Store",
      })
    } catch (error: any) {
      console.error("[Add Item] Error adding item:", error)
      
      // Show user-friendly error message
      if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Failed to add product. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Professional Header with Dark Gradient */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6 border-b border-slate-600 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-white">Add New Product</span>
            </DialogTitle>
            <DialogDescription className="text-slate-200 text-sm mt-2 font-medium">
              Create a new product in your inventory
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                Product Name
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="category" className="w-full max-w-xs rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent className="w-full max-w-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
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
                className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </form>

        {/* Professional Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-8 py-6 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 text-sm font-semibold border-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              onClick={handleSubmit}
              className="h-11 px-6 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
