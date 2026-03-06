"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem, Store } from "@/lib/types"
import type { BundleComponent } from "@/lib/types/bundle"
import { apiGet, apiPost } from "@/lib/api-client"
import { formatCurrency, cn } from "@/lib/utils"
import { showSuccess, showError } from "@/lib/toast-utils"
import { generateBundleSKU, calculateBundleCost, calculateVirtualStock } from "@/lib/bundle-utils"

interface CreateBundleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateBundleModal({ open, onOpenChange, onSuccess }: CreateBundleModalProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Bundle form data
  const [bundleName, setBundleName] = useState("")
  const [bundleCategory, setBundleCategory] = useState("")
  const [bundleSalesChannel, setBundleSalesChannel] = useState("")
  const [bundleStore, setBundleStore] = useState("")
  const [bundleSellingPrice, setBundleSellingPrice] = useState(0)
  const [bundleDescription, setBundleDescription] = useState("")
  const [components, setComponents] = useState<BundleComponent[]>([])
  
  // Component selection
  const [selectedItemId, setSelectedItemId] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  const SALES_CHANNELS = ['Shopee', 'Lazada', 'Facebook', 'TikTok', 'Physical Store'] as const

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  async function fetchData() {
    try {
      setLoadingData(true)
      const [itemsData, storesData, categoriesData] = await Promise.all([
        apiGet<InventoryItem[]>("/api/items"),
        apiGet<Store[]>("/api/stores"),
        apiGet<Array<{id: string, name: string}>>("/api/categories")
      ])
      
      // Filter out bundle products from component selection
      const regularItems = itemsData.filter((item: any) => !item.product_type || item.product_type === 'regular')
      setItems(regularItems)
      setStores(storesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      showError("Failed to load data")
    } finally {
      setLoadingData(false)
    }
  }

  function handleAddComponent() {
    if (!selectedItemId || selectedQuantity <= 0) {
      showError("Please select an item and valid quantity")
      return
    }

    const item = items.find(i => i.id === selectedItemId)
    if (!item) return

    // Check if component already exists
    const existingIndex = components.findIndex(c => c.itemId === selectedItemId)
    if (existingIndex >= 0) {
      // Update existing component quantity
      const updated = [...components]
      updated[existingIndex].quantity += selectedQuantity
      setComponents(updated)
      showSuccess(`Updated ${item.name} quantity`)
    } else {
      // Add new component
      const newComponent: BundleComponent = {
        itemId: item.id,
        itemName: item.name,
        quantity: selectedQuantity,
        costPrice: item.costPrice,
        currentStock: item.quantity
      }
      setComponents([...components, newComponent])
      showSuccess(`Added ${item.name} to bundle`)
    }

    // Reset selection
    setSelectedItemId("")
    setSelectedQuantity(1)
  }

  function handleRemoveComponent(itemId: string) {
    setComponents(components.filter(c => c.itemId !== itemId))
  }

  function handleUpdateComponentQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      handleRemoveComponent(itemId)
      return
    }
    setComponents(components.map(c => 
      c.itemId === itemId ? { ...c, quantity } : c
    ))
  }

  async function handleSubmit() {
    // Validation
    if (!bundleName.trim()) {
      showError("Please enter bundle name")
      return
    }
    if (!bundleCategory) {
      showError("Please select a category")
      return
    }
    if (!bundleSalesChannel) {
      showError("Please select a sales channel")
      return
    }
    if (!bundleStore) {
      showError("Please select a store")
      return
    }
    if (components.length === 0) {
      showError("Please add at least one component")
      return
    }
    if (bundleSellingPrice <= 0) {
      showError("Please enter a valid selling price")
      return
    }

    setLoading(true)
    try {
      // Calculate bundle cost from components
      const bundleCost = calculateBundleCost(components)
      
      // Calculate virtual stock (how many bundles can be made)
      const virtualStock = calculateVirtualStock(components)
      
      // Generate SKU
      const sku = generateBundleSKU(bundleName, components)

      // Create bundle
      await apiPost("/api/bundles", {
        name: bundleName,
        category: bundleCategory,
        sales_channel: bundleSalesChannel,
        store: bundleStore,
        cost_price: bundleCost,
        selling_price: bundleSellingPrice,
        description: bundleDescription,
        components: components.map(c => ({
          item_id: c.itemId,
          quantity: c.quantity
        })),
        sku: sku,
        reorder_level: 5, // Default reorder level
        is_virtual_stock: true,
        metadata: {
          description: bundleDescription
        }
      })

      showSuccess(`Bundle "${bundleName}" created successfully!`)
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error creating bundle:", error)
      showError("Failed to create bundle")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setBundleName("")
    setBundleCategory("")
    setBundleSalesChannel("")
    setBundleStore("")
    setBundleSellingPrice(0)
    setBundleDescription("")
    setComponents([])
    setSelectedItemId("")
    setSelectedQuantity(1)
  }

  // Calculate totals
  const totalCost = calculateBundleCost(components)
  const profitMargin = bundleSellingPrice > 0 ? ((bundleSellingPrice - totalCost) / bundleSellingPrice * 100) : 0
  const virtualStock = components.length > 0 ? calculateVirtualStock(components) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            Create Bundle Product
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base">
            Combine multiple products into a single bundle with custom pricing
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Bundle Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Bundle Information
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bundleName" className="text-slate-700 dark:text-slate-300 font-medium">
                    Bundle Name *
                  </Label>
                  <Input
                    id="bundleName"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    placeholder="e.g., Starter Pack, Family Bundle"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundleCategory" className="text-slate-700 dark:text-slate-300 font-medium">
                    Category *
                  </Label>
                  <Select value={bundleCategory} onValueChange={setBundleCategory}>
                    <SelectTrigger id="bundleCategory" className="rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundleSalesChannel" className="text-slate-700 dark:text-slate-300 font-medium">
                    Sales Channel *
                  </Label>
                  <Select value={bundleSalesChannel} onValueChange={(value) => {
                    setBundleSalesChannel(value)
                    setBundleStore("") // Reset store when channel changes
                  }}>
                    <SelectTrigger id="bundleSalesChannel" className="rounded-lg">
                      <SelectValue placeholder="Select sales channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALES_CHANNELS.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bundleStore" className="text-slate-700 dark:text-slate-300 font-medium">
                    Store *
                  </Label>
                  <Select 
                    value={bundleStore} 
                    onValueChange={setBundleStore}
                    disabled={!bundleSalesChannel}
                  >
                    <SelectTrigger id="bundleStore" className="rounded-lg">
                      <SelectValue placeholder={!bundleSalesChannel ? "Select channel first" : "Select store"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stores
                        .filter(s => s.sales_channel === bundleSalesChannel)
                        .map((store) => (
                          <SelectItem key={store.id} value={store.store_name}>
                            {store.store_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bundleDescription" className="text-slate-700 dark:text-slate-300 font-medium">
                    Description (Optional)
                  </Label>
                  <Input
                    id="bundleDescription"
                    value={bundleDescription}
                    onChange={(e) => setBundleDescription(e.target.value)}
                    placeholder="Brief description of the bundle"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Add Components Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Bundle Components
              </h3>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select product to add" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {items
                        .filter(item => !components.find(c => c.itemId === item.id))
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span>{item.name}</span>
                              <span className="text-xs text-slate-500">
                                Stock: {item.quantity} | {formatCurrency(item.costPrice)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                  className="w-24 rounded-lg"
                />
                <Button
                  onClick={handleAddComponent}
                  disabled={!selectedItemId || selectedQuantity <= 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Components List */}
              {components.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No components added yet</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add products to create your bundle</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  {components.map((component) => (
                    <div
                      key={component.itemId}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                          {component.itemName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(component.costPrice)} × {component.quantity} = {formatCurrency(component.costPrice * component.quantity)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Available stock: {component.currentStock}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={component.quantity}
                          onChange={(e) => handleUpdateComponentQuantity(component.itemId, parseInt(e.target.value) || 1)}
                          className="w-20 h-9 text-sm text-center"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComponent(component.itemId)}
                          className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Pricing & Summary
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Total Cost (Auto-calculated)
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalCost)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Sum of all component costs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bundleSellingPrice" className="text-slate-700 dark:text-slate-300 font-medium">
                      Bundle Selling Price *
                    </Label>
                    <Input
                      id="bundleSellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={bundleSellingPrice}
                      onChange={(e) => setBundleSellingPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Enter selling price"
                      className="rounded-lg text-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={cn(
                    "p-4 rounded-lg border",
                    profitMargin >= 30 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : profitMargin >= 15
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  )}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                       style={{ color: profitMargin >= 30 ? '#16a34a' : profitMargin >= 15 ? '#d97706' : '#dc2626' }}>
                      Profit Margin
                    </p>
                    <p className="text-2xl font-bold"
                       style={{ color: profitMargin >= 30 ? '#16a34a' : profitMargin >= 15 ? '#d97706' : '#dc2626' }}>
                      {profitMargin.toFixed(1)}%
                    </p>
                    <p className="text-xs mt-1"
                       style={{ color: profitMargin >= 30 ? '#16a34a' : profitMargin >= 15 ? '#d97706' : '#dc2626' }}>
                      Profit: {formatCurrency(bundleSellingPrice - totalCost)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Virtual Stock
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {virtualStock} bundles
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Based on component availability
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {components.length > 0 && (
                <div className="space-y-2">
                  {virtualStock === 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                          Insufficient component stock
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          One or more components don't have enough stock to create this bundle
                        </p>
                      </div>
                    </div>
                  )}
                  {bundleSellingPrice > 0 && bundleSellingPrice <= totalCost && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                          Low or negative profit margin
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Selling price should be higher than total cost for profitability
                        </p>
                      </div>
                    </div>
                  )}
                  {bundleSellingPrice > totalCost && profitMargin >= 30 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                          Excellent profit margin!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          This bundle has a healthy profit margin of {profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              resetForm()
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || components.length === 0 || !bundleName || !bundleCategory || !bundleSalesChannel || !bundleStore || bundleSellingPrice <= 0}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Bundle...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Bundle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
