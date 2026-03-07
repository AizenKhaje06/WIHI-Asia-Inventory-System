'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, X, TrendingDown, Search, Check, ChevronDown, ShoppingCart } from 'lucide-react'
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
    category: '',
    store: '',
    salesChannel: '',
    bundlePrice: 0,
    sku: '',
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
    
    if (!formData.category) {
      toast.error('Please select a category')
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
      const response = await apiPost('/api/bundles', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        store: formData.store,
        salesChannel: formData.salesChannel || null,
        bundlePrice: formData.bundlePrice,
        items: bundleItems.map(bi => ({
          itemId: bi.itemId,
          quantity: bi.quantity
        })),
        sku: formData.sku.trim() || null,
        badge: formData.badge.trim() || null
      })

      toast.success('Bundle created successfully!')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating bundle:', error)
      toast.error(error.message || 'Failed to create bundle. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      store: '',
      salesChannel: '',
      bundlePrice: 0,
      sku: '',
      badge: ''
    })
    setBundleItems([])
    setSearchValue('')
  }

  const totals = calculateTotals()
  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)))
  const stores = Array.from(new Set(items.map(i => i.store).filter(Boolean)))

  // Filter items for search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.category.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
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

        <div className="flex-1 overflow-y-auto py-4 relative">
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
                  <Label className="text-sm font-semibold">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="default" disabled>No categories available</SelectItem>
                      )}
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
                      {stores.length > 0 ? (
                        stores.map(store => (
                          <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="default" disabled>No stores available</SelectItem>
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

            {/* Right Column - Bundle Items */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Add Items to Bundle *</Label>
                <Popover open={searchOpen} onOpenChange={setSearchOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full h-11 justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Search products... ({items.length} available)
                        </span>
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[500px] p-0 z-[100]" 
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={true}
                    collisionPadding={20}
                  >
                    <Command className="rounded-lg border shadow-md">
                      <CommandInput 
                        placeholder="Search by name, category, or SKU..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="h-11"
                      />
                      <CommandList className="max-h-[280px] overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm">
                          No products found.
                        </CommandEmpty>
                        <CommandGroup heading={`Products (${filteredItems.length})`}>
                          {filteredItems.slice(0, 50).map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.id}
                              onSelect={() => addBundleItem(item.id)}
                              className="flex items-center justify-between py-3 cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className="text-xs text-slate-500 truncate">
                                  {item.category} • Stock: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right ml-4 flex-shrink-0">
                                <p className="font-bold text-sm">₱{item.sellingPrice.toFixed(2)}</p>
                                <p className="text-xs text-slate-500">Cost: ₱{item.costPrice.toFixed(2)}</p>
                              </div>
                            </CommandItem>
                          ))}
                          {filteredItems.length > 50 && (
                            <div className="py-2 px-4 text-xs text-center text-slate-500 border-t">
                              Showing first 50 results. Refine your search to see more.
                            </div>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[500px] bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm">Bundle Contents</h4>
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
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
                    {bundleItems.map((bi, index) => (
                      <div key={bi.itemId} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{bi.itemName}</p>
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
                          <p className="text-sm font-bold">₱{(bi.unitPrice * bi.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
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
