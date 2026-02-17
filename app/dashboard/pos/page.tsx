"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Trash2, CheckCircle, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import type { InventoryItem } from "@/lib/types"
import { apiGet, apiPost } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"

interface CartItem {
  item: InventoryItem
  quantity: number
}

export default function POSPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState('')
  const [salesChannel, setSalesChannel] = useState('') // For demo/internal use
  const [destinationStorage, setDestinationStorage] = useState('') // For warehouse transfer
  const [storageRooms, setStorageRooms] = useState<string[]>([])
  const [staffName, setStaffName] = useState('')
  const [notes, setNotes] = useState('')
  const [dispatchId, setDispatchId] = useState('')
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const total = useMemo(() => cart.reduce((sum, cartItem) => sum + cartItem.item.sellingPrice * cartItem.quantity, 0), [cart])

  const filteredItems = useMemo(() => {
    let filtered = items

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(searchLower) ||
                  item.category.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }, [search, items])

  useEffect(() => {
    // Get current logged-in user using the auth helper
    const currentUser = getCurrentUser()
    console.log('[POS] Current user:', currentUser) // Debug log
    
    if (currentUser) {
      const name = currentUser.displayName || currentUser.username || 'Unknown User'
      console.log('[POS] Setting staff name to:', name) // Debug log
      setStaffName(name)
    } else {
      console.warn('[POS] No current user found in localStorage')
      setStaffName('Unknown User')
    }
    
    fetchItems()
    fetchStorageRooms()
  }, [])

  async function fetchItems() {
    try {
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
    } catch (error) {
      console.error("[POS] Error fetching items:", error)
      setItems([])
    }
  }

  async function fetchStorageRooms() {
    try {
      const data = await apiGet<any[]>('/api/storage-rooms')
      const rooms = data.map(room => room.name)
      setStorageRooms(rooms)
    } catch (error) {
      console.error('Error fetching storage rooms:', error)
    }
  }

  function addToCart(item: InventoryItem) {
    const existingItem = cart.find((cartItem) => cartItem.item.id === item.id)

    if (existingItem) {
      if (existingItem.quantity < item.quantity) {
        setCart(
          cart.map((cartItem) =>
            cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          ),
        )
      }
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    const cartItem = cart.find((ci) => ci.item.id === itemId)
    if (!cartItem) return

    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    // Allow any quantity to be entered, but cap at available stock
    const finalQuantity = Math.min(quantity, cartItem.item.quantity)
    setCart(cart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: finalQuantity } : ci)))
  }

  function removeFromCart(itemId: string) {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
  }

  async function handleCheckout() {
    if (cart.length === 0 || !department || !staffName) return
    
    // Check if demo/internal use requires sales channel
    const requiresSalesChannel = ['Demo/Display', 'Internal Use'].includes(department)
    if (requiresSalesChannel && !salesChannel) {
      alert('Please select a sales channel for demo/internal use')
      return
    }

    // Check if warehouse transfer requires destination storage
    if (department === 'Warehouse' && !destinationStorage) {
      alert('Please select a destination storage room for warehouse transfer')
      return
    }

    setLoading(true)
    try {
      const saleItems = cart.map((cartItem) => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      }))

      // Combine department and sales channel/storage room if applicable
      const finalDepartment = requiresSalesChannel && salesChannel 
        ? `${department} / ${salesChannel}`
        : department === 'Warehouse' && destinationStorage
        ? `${department} / ${destinationStorage}`
        : department

      await apiPost("/api/sales", {
        items: saleItems,
        department: finalDepartment,
        staffName,
        notes,
      })

      // Generate dispatch ID
      const newDispatchId = `WD-${Date.now()}`
      setDispatchId(newDispatchId)
      
      setCart([])
      fetchItems()
      setSuccessModalOpen(true)

      // Reset form fields (keep staffName as it's tied to logged-in user)
      setDepartment('')
      setSalesChannel('')
      setDestinationStorage('')
      setNotes('')
    } catch (error) {
      console.error("[v0] Error processing sale:", error)
      alert("Failed to process sale")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Warehouse Dispatch
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Stock release and distribution management
        </p>
      </div>

      {/* Top Section: Dispatch Form + Cart Summary */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-6">
        {/* Dispatch Form - Left */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Dispatch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Dispatched By *
              </Label>
              <div className="relative mt-1.5">
                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {staffName ? staffName.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {staffName || 'Unknown User'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Currently logged in
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Auto-verified from your account for security
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Destination *</Label>
              <Select value={department} onValueChange={(value) => {
                setDepartment(value)
                // Reset sales channel when destination changes
                if (!['Demo/Display', 'Internal Use'].includes(value)) {
                  setSalesChannel('')
                }
                // Reset destination storage when not warehouse
                if (value !== 'Warehouse') {
                  setDestinationStorage('')
                }
              }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Sales Channels</div>
                  <SelectItem value="Facebook">📘 Facebook Store</SelectItem>
                  <SelectItem value="Tiktok">🎵 Tiktok Shop</SelectItem>
                  <SelectItem value="Lazada">🛒 Lazada</SelectItem>
                  <SelectItem value="Shopee">🛍️ Shopee</SelectItem>
                  <SelectItem value="Physical Store">🏪 Physical Store</SelectItem>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Internal Use</div>
                  <SelectItem value="Demo/Display">🎯 Demo/Display</SelectItem>
                  <SelectItem value="Internal Use">🔧 Internal Use</SelectItem>
                  <SelectItem value="Warehouse">📦 Warehouse Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Sales Channel Dropdown */}
            {(department === 'Demo/Display' || department === 'Internal Use') && (
              <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sales Channel * <span className="text-xs text-slate-500">(Where will this be used?)</span>
                </Label>
                <Select value={salesChannel} onValueChange={setSalesChannel}>
                  <SelectTrigger className="mt-1.5 border-blue-300 dark:border-blue-700">
                    <SelectValue placeholder="Select sales channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">📘 Facebook Store</SelectItem>
                    <SelectItem value="Tiktok">🎵 Tiktok Shop</SelectItem>
                    <SelectItem value="Lazada">🛒 Lazada</SelectItem>
                    <SelectItem value="Shopee">🛍️ Shopee</SelectItem>
                    <SelectItem value="Physical Store">🏪 Physical Store</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This will be saved as: <span className="font-semibold text-blue-600 dark:text-blue-400">{department} / {salesChannel || '...'}</span>
                </p>
              </div>
            )}

            {/* Conditional Warehouse Storage Room Dropdown */}
            {department === 'Warehouse' && (
              <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Destination Storage Room * <span className="text-xs text-slate-500">(Transfer to which storage?)</span>
                </Label>
                <Select value={destinationStorage} onValueChange={setDestinationStorage}>
                  <SelectTrigger className="mt-1.5 border-indigo-300 dark:border-indigo-700">
                    <SelectValue placeholder="Select destination storage" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        📦 {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Items will be transferred to: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{destinationStorage || '...'}</span>
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</Label>
              <Input
                placeholder="Purpose or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button 
              onClick={handleCheckout} 
              disabled={loading || !department || !staffName || cart.length === 0} 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
              size="lg"
            >
              {loading ? "Processing..." : `Dispatch ${cart.length > 0 ? `(${cart.length} items)` : ''}`}
            </Button>
          </CardContent>
        </Card>

        {/* Cart Summary - Right */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Cart Summary</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₱{total.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No items in cart</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Select products below to add</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {cart.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center gap-3 p-3 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{cartItem.item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ₱{cartItem.item.sellingPrice.toFixed(2)} × {cartItem.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={cartItem.item.quantity}
                        value={cartItem.quantity}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow empty input for editing
                          if (value === '') {
                            return
                          }
                          // Parse and validate the number
                          const numValue = parseInt(value, 10)
                          if (!isNaN(numValue) && numValue >= 1) {
                            updateQuantity(cartItem.item.id, numValue)
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure we have a valid value
                          const value = e.target.value
                          if (value === '' || parseInt(value, 10) < 1) {
                            updateQuantity(cartItem.item.id, 1)
                          }
                        }}
                        className="min-w-[60px] max-w-[100px] h-8 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFromCart(cartItem.item.id)} 
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 min-w-[70px] text-right">
                      ₱{(cartItem.item.sellingPrice * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Products ({filteredItems.length})
            </CardTitle>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredItems.map((item) => {
              const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
              const isOutOfStock = item.quantity === 0
              
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={isOutOfStock}
                  className={`
                    relative rounded-[5px] border-2 p-3 text-left transition-all duration-200
                    ${isOutOfStock 
                      ? 'border-red-200 bg-red-50 dark:bg-red-900/10 opacity-60 cursor-not-allowed' 
                      : isLowStock
                      ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 hover:border-amber-400 hover:shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-red-500 text-white">
                        OUT
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
                        LOW
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.quantity}
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <div className="mt-6 mb-3">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₱{item.sellingPrice.toFixed(2)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No products found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Items Dispatched Successfully!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Stock has been released and transaction logged
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[5px] p-4">
              <p className="text-center text-green-800 dark:text-green-200 font-medium mb-2">
                Stock Released to {department}
              </p>
              <p className="text-center text-sm text-green-700 dark:text-green-300">
                Dispatch ID: <span className="font-mono font-bold">{dispatchId}</span>
              </p>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>✓ Inventory has been updated</p>
              <p>✓ Transaction logged successfully</p>
              <p>✓ Staff: {staffName}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessModalOpen(false)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
