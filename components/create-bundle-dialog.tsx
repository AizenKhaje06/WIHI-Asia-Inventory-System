'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Package, X, TrendingDown, Search, Check, ChevronDown, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { apiGet, apiPost } from '@/lib/api-client'
import type { InventoryItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CreateBundleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface BundleItem {
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  unitCost: number
}

export function CreateBundleDialog({ open, onOpenChange, onSuccess }: CreateBundleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    store: '',
    salesChannel: '',
    bundlePrice: 0,
    badge: ''
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false)
      }
    }

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchOpen])

  useEffect(() => {
    if (open) {
      fetchItems()
      resetForm()
    }
  }, [open])

  const fetchItems = async () => {
    try {
      const data = await apiGet<InventoryItem[]>('/api/items')
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to load items')
    }
  }

  const addBundleItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const exists = bundleItems.find(bi => bi.itemId === itemId)
    if (exists) {
      toast.warning('Item already added to bundle')
      return
    }

    setBundleItems([...bundleItems, {
      itemId: item.id,
      itemName: item.name,
      quantity: 1,
      unitPrice: item.sellingPrice,
      unitCost: item.costPrice
    }])
    
    setSearchOpen(false)
    setSearchValue('')
    toast.success(`${item.name} added to bundle`)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setBundleItems(bundleItems.map(bi => 
      bi.itemId === itemId ? { ...bi, quantity } : bi
    ))
  }

  const removeItem = (itemId: string) => {
    setBundleItems(bundleItems.filter(bi => bi.itemId !== itemId))
  }

  const calculateTotals = () => {
    const regularPrice = bundleItems.reduce((sum, bi) => sum + (bi.unitPrice * bi.quantity), 0)
    const bundleCost = bundleItems.reduce((sum, bi) => sum + (bi.unitCost * bi.quantity), 0)
    const savings = regularPrice - formData.bundlePrice
    const savingsPercent = regularPrice > 0 ? (savings / regularPrice) * 100 : 0
    const profit = formData.bundlePrice - bundleCost
    const profitMargin = formData.bundlePrice > 0 ? (profit / formData.bundlePrice) * 100 : 0

    return { regularPrice, bundleCost, savings, savingsPercent, profit, profitMargin }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter bundle name')
      return
    }
    
    if (!formData.store) {
      toast.error('Please select a store')
      return
    }
    
    if (bundleItems.length === 0) {
      toast.error('Please add at least one item to the bundle')
      return
    }
    
    if (!formData.bundlePrice || formData.bundlePrice <= 0) {
      toast.error('Please enter a valid bundle price')
      return
    }

    const totals = calculateTotals()
    if (formData.bundlePrice < totals.bundleCost) {
      toast.error('Bundle price cannot be below cost!')
      return
    }

    setLoading(true)
    try {
      console.log('Creating bundle with data:', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        store: formData.store,
        salesChannel: formData.salesChannel || null,
        bundlePrice: formData.bundlePrice,
        items: bundleItems.map(bi => ({
          itemId: bi.itemId,
          quantity: bi.quantity
        })),
        badge: formData.badge.trim() || null
      })

      const response = await apiPost('/api/bundles', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        store: formData.store,
        salesChannel: formData.salesChannel || null,
        bundlePrice: formData.bundlePrice,
        items: bundleItems.map(bi => ({
          itemId: bi.itemId,
          quantity: bi.quantity
        })),
        badge: formData.badge.trim() || null
      })

      console.log('Bundle created successfully:', response)
      toast.success('Bundle created successfully!')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating bundle:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        bundleItems,
        formData
      })
      toast.error(error.message || 'Failed to create bundle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      store: '',
      salesChannel: '',
      bundlePrice: 0,
      badge: ''
    })
    setBundleItems([])
    setSearchValue('')
  }

  const totals = calculateTotals()
  
  // Fetch stores from API with sales_channel
  const [storesData, setStoresData] = useState<Array<{id: string, store_name: string, sales_channel: string}>>([])
  
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await apiGet<Array<{id: string, store_name: string, sales_channel: string}>>('/api/stores')
        setStoresData(data)
      } catch (error) {
        console.error('Error fetching stores:', error)
      }
    }
    if (open) fetchStores()
  }, [open])
  
  // Filter stores based on selected sales channel
  const filteredStores = formData.salesChannel && formData.salesChannel !== 'none'
    ? storesData.filter(s => s.sales_channel === formData.salesChannel)
    : storesData

  // Filter items for search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.category.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Create Product Bundle
          </DialogTitle>
          <DialogDescription className="text-base">
            Create a bundle of products with special pricing to increase sales
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Bundle Info */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Bundle Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Berry Soap 3-Pack"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this bundle..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Sales Channel *</Label>
                  <Select value={formData.salesChannel || "none"} onValueChange={(value) => {
                    const newChannel = value === "none" ? "" : value
                    setFormData({...formData, salesChannel: newChannel, store: ''}) // Reset store when channel changes
                  }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select sales channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Channels</SelectItem>
                      <SelectItem value="Physical Store">Physical Store</SelectItem>
                      <SelectItem value="Shopee">Shopee</SelectItem>
                      <SelectItem value="Lazada">Lazada</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Store *</Label>
                  <Select value={formData.store} onValueChange={(value) => setFormData({...formData, store: value})}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStores.length > 0 ? (
                        filteredStores.map(store => (
                          <SelectItem key={store.id} value={store.store_name}>
                            {store.store_name} {store.sales_channel && `(${store.sales_channel})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="default" disabled>
                          {formData.salesChannel && formData.salesChannel !== 'none' 
                            ? `No stores for ${formData.salesChannel}` 
                            : 'No stores available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Badge (Optional)</Label>
                <Input
                  value={formData.badge}
                  onChange={(e) => setFormData({...formData, badge: e.target.value})}
                  placeholder="e.g., BEST VALUE, SAVE 20%"
                  className="h-11"
                />
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Pricing Summary
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Regular Price:</span>
                    <span className="font-bold text-base">₱{totals.regularPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Bundle Cost:</span>
                    <span className="font-bold text-base">₱{totals.bundleCost.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span className="font-medium">Customer Saves:</span>
                    <span className="font-bold text-base">₱{totals.savings.toFixed(2)} ({totals.savingsPercent.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Your Profit:</span>
                    <span className="font-bold text-base">₱{totals.profit.toFixed(2)} ({totals.profitMargin.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Bundle Price * 
                  <span className="text-xs font-normal text-slate-500 ml-2">(What customer pays)</span>
                </Label>
                <Input
                  type="number"
                  value={formData.bundlePrice || ''}
                  onChange={(e) => setFormData({...formData, bundlePrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="h-12 text-xl font-bold"
                  min="0"
                  step="0.01"
                />
                {formData.bundlePrice > 0 && formData.bundlePrice < totals.bundleCost && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <span className="text-base">⚠️</span> Price is below cost! Minimum: ₱{totals.bundleCost.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Product Selector & Bundle Items */}
            <div className="space-y-4">
              {/* Custom Product Search Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Add Items to Bundle *</Label>
                <div className="relative" ref={searchContainerRef}>
                  <div
                    className={cn(
                      "relative w-full h-11 border rounded-lg bg-white dark:bg-slate-950 cursor-pointer transition-all",
                      searchOpen 
                        ? "border-purple-500 ring-2 ring-purple-500/20" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                    onClick={() => setSearchOpen(!searchOpen)}
                  >
                    <div className="flex items-center h-full px-3 gap-2">
                      <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value)
                          setSearchOpen(true)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSearchOpen(true)
                        }}
                        placeholder={`Search products... (${items.length} available)`}
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                      />
                      <ChevronDown className={cn(
                        "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform",
                        searchOpen && "rotate-180"
                      )} />
                    </div>
                  </div>

                  {/* Custom Dropdown */}
                  {searchOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[9999] overflow-hidden"
                      style={{ maxHeight: '320px' }}
                    >
                      <div className="overflow-y-auto max-h-[320px]" style={{ scrollbarWidth: 'thin' }}>
                        {filteredItems.length === 0 ? (
                          <div className="py-8 text-center">
                            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                              <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No products found</p>
                            <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          <>
                            <div className="sticky top-0 bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 z-10">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                Products ({filteredItems.length})
                              </p>
                            </div>
                            <div className="p-2">
                              {filteredItems.slice(0, 50).map((item) => {
                                const isAdded = bundleItems.some(bi => bi.itemId === item.id)
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => !isAdded && addBundleItem(item.id)}
                                    disabled={isAdded}
                                    className={cn(
                                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                      isAdded
                                        ? "bg-green-50 dark:bg-green-900/20 cursor-not-allowed opacity-60"
                                        : "hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                    )}
                                  >
                                    {/* Product Icon */}
                                    <div className={cn(
                                      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                                      isAdded 
                                        ? "bg-green-100 dark:bg-green-900/30" 
                                        : "bg-purple-100 dark:bg-purple-900/30"
                                    )}>
                                      {isAdded ? (
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                      ) : (
                                        <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                      )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {item.category} • Stock: {item.quantity}
                                      </p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right flex-shrink-0">
                                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                        ₱{item.sellingPrice.toFixed(2)}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Cost: ₱{item.costPrice.toFixed(2)}
                                      </p>
                                    </div>
                                  </button>
                                )
                              })}
                              {filteredItems.length > 50 && (
                                <div className="py-3 px-4 text-center border-t border-slate-200 dark:border-slate-700 mt-2">
                                  <p className="text-xs text-slate-500">
                                    Showing first 50 results. Refine your search to see more.
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bundle Contents */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50" style={{ minHeight: '400px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Bundle Contents
                  </h4>
                  <Badge variant="outline" className="font-semibold">
                    {bundleItems.length} {bundleItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
                
                {bundleItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex p-4 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">No items added yet</p>
                    <p className="text-xs text-slate-500">Search and select products to add to this bundle</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    {bundleItems.map((bi, index) => (
                      <div key={bi.itemId} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{bi.itemName}</p>
                          <p className="text-xs text-slate-500">₱{bi.unitPrice.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={bi.quantity}
                            onChange={(e) => updateQuantity(bi.itemId, parseInt(e.target.value) || 1)}
                            className="w-16 h-9 text-center font-semibold"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(bi.itemId)}
                            className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">₱{(bi.unitPrice * bi.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }} 
            disabled={loading}
            className="h-11"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || bundleItems.length === 0}
            className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Bundle...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Bundle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
