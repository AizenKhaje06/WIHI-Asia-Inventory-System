"use client"

import { useEffect, useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Trash2, CheckCircle, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { InventoryItem } from "@/lib/types"

interface CartItem {
  item: InventoryItem
  quantity: number
}

export default function POSPage() {
  const { theme } = useTheme()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState('')
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
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
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch("/api/items")
      if (!res.ok) throw new Error("Failed to fetch items")
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error("[v0] Error fetching items:", error)
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

    if (quantity <= cartItem.item.quantity) {
      setCart(cart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci)))
    }
  }

  function removeFromCart(itemId: string) {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId))
  }

  async function handleCheckout() {
    if (cart.length === 0) return

    setLoading(true)
    try {
      const saleItems = cart.map((cartItem) => ({
        itemId: cartItem.item.id,
        quantity: cartItem.quantity,
      }))

      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: saleItems,
          department,
        }),
      })

      setCart([])
      fetchItems()
      setOrderSummaryOpen(false)
      setSuccessModalOpen(true)

      // Reset form fields
      setDepartment('')
    } catch (error) {
      console.error("[v0] Error processing sale:", error)
      alert("Failed to process sale")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Point of Sale
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Professional sales transaction processing system
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-slate-700 dark:text-slate-300 font-medium">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-150">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                  <Package className="h-5 w-5" />
                </div>
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="h-32 rounded-lg border border-border bg-secondary p-4 text-center transition-colors hover:bg-secondary/80 flex flex-col justify-between"
                      disabled={item.quantity === 0}
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {item.quantity}</p>
                      </div>
                      <p className={`text-lg font-semibold ${theme === 'light' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent' : 'text-[#00FF00]'}`}>₱{item.sellingPrice.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">Cart is empty</p>
                ) : (
                  <>
                    <div className="max-h-[400px] space-y-4 overflow-y-auto">
                      {cart.map((cartItem) => (
                        <div
                          key={cartItem.item.id}
                          className="flex items-center gap-4 rounded-lg border border-border p-4"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{cartItem.item.name}</p>
                            <p className={`text-sm ${theme === 'light' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent' : 'text-[#00FF00]'}`}>
                              ₱{cartItem.item.sellingPrice.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max={cartItem.item.quantity}
                              value={cartItem.quantity}
                              onChange={(e) => updateQuantity(cartItem.item.id, Number.parseInt(e.target.value))}
                              className="w-20"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeFromCart(cartItem.item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className={`font-semibold ${theme === 'light' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent' : 'text-[#00FF00]'}`}>
                            ₱{(cartItem.item.sellingPrice * cartItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-lg font-semibold text-foreground">Total</p>
                        <p className={`text-2xl font-bold ${theme === 'light' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent' : 'text-[#00FF00]'}`}>₱{total.toFixed(2)}</p>
                      </div>

                      <div className="space-y-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium text-foreground">Department</Label>
                          <Select value={department} onValueChange={(value) => setDepartment(value)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="Tiktok">Tiktok</SelectItem>
                              <SelectItem value="Lazada">Lazada</SelectItem>
                              <SelectItem value="Shopee">Shopee</SelectItem>
                              <SelectItem value="Warehouse">Warehouse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={() => setOrderSummaryOpen(true)} disabled={loading || !department} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                        Proceed
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={orderSummaryOpen} onOpenChange={setOrderSummaryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {cart.map((cartItem) => (
                <div key={cartItem.item.id} className="flex justify-between">
                  <span>{cartItem.item.name} x{cartItem.quantity}</span>
                  <span>₱{(cartItem.item.sellingPrice * cartItem.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Department</span>
                <span>{department}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderSummaryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={loading}>
              {loading ? "Processing..." : "Complete Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Sale Completed Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p>The transaction has been processed and inventory updated.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
