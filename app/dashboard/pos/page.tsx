"use client"

import { useEffect, useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Trash2, CheckCircle, CreditCard, Smartphone } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'ewallet' | 'online'>('cash')
  const [department, setDepartment] = useState('')
  const [eWalletType, setEWalletType] = useState<'gcash' | 'paymaya'>('gcash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  const total = useMemo(() => cart.reduce((sum, cartItem) => sum + cartItem.item.sellingPrice * cartItem.quantity, 0), [cart])

  const change = useMemo(() => paymentMethod === 'cash' && amountPaid ? parseFloat(amountPaid) - total : 0, [paymentMethod, amountPaid, total])

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

    const fullPaymentMethod = paymentMethod === 'cash' ? 'cash' : paymentMethod === 'online' ? 'online' : eWalletType

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
          paymentMethod: fullPaymentMethod,
          referenceNumber: paymentMethod === 'cash' ? undefined : referenceNumber,
          amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : undefined,
          change: paymentMethod === 'cash' ? change : undefined,
          department: paymentMethod === 'online' ? department : undefined
        }),
      })

      setCart([])
      fetchItems()
      setOrderSummaryOpen(false)
      setSuccessModalOpen(true)

      // Reset form fields
      setPaymentMethod('cash')
      setDepartment('')
      setEWalletType('gcash')
      setReferenceNumber('')
      setAmountPaid('')
    } catch (error) {
      console.error("[v0] Error processing sale:", error)
      alert("Failed to process sale")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen dark:from-slate-900 dark:to-slate-800">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">
          Point of Sale
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Professional sales transaction processing system</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className={`mb-6 bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-100 shadow-lg' : 'from-black via-black/50 to-gray-900'} border-border`}>
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

          <Card className={`bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-100 shadow-lg' : 'from-black via-black/50 to-gray-900'} border-border`}>
            <CardHeader>
              <CardTitle className="text-foreground">Products</CardTitle>
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
          <Card className={`bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-100 shadow-lg' : 'from-black via-black/50 to-gray-900'} border-border`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ShoppingCart className="h-5 w-5" />
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
                          <Label className="text-sm font-medium text-foreground">Payment Method</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                              onClick={() => setPaymentMethod('cash')}
                              className="flex-1"
                            >
                              Cash
                            </Button>
                            <Button
                              variant={paymentMethod === 'ewallet' ? 'default' : 'outline'}
                              onClick={() => setPaymentMethod('ewallet')}
                              className="flex-1"
                            >
                              E-Wallet
                            </Button>
                            <Button
                              variant={paymentMethod === 'online' ? 'default' : 'outline'}
                              onClick={() => setPaymentMethod('online')}
                              className="flex-1"
                            >
                              Online
                            </Button>
                          </div>
                        </div>

                        {paymentMethod === 'cash' && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-foreground">Amount Paid</Label>
                              <Input
                                type="number"
                                placeholder="Enter amount paid"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="mt-2"
                                min={total}
                              />
                            </div>
                            {change !== 0 && (
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-foreground">Change</Label>
                                <p className={`text-lg font-semibold ${change < 0 ? 'text-red-500' : theme === 'light' ? 'bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent' : 'text-[#00FF00]'}`}>
                                  ₱{change.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {paymentMethod === 'ewallet' && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-foreground">E-Wallet Type</Label>
                              <Select value={eWalletType} onValueChange={(value) => setEWalletType(value as 'gcash' | 'paymaya')}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gcash">GCash</SelectItem>
                                  <SelectItem value="paymaya">PayMaya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-foreground">Reference Number</Label>
                              <Input
                                placeholder="Enter reference number"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'online' && (
                          <div className="space-y-4">
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
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button onClick={() => setOrderSummaryOpen(true)} disabled={loading || (paymentMethod === 'ewallet' && !referenceNumber) || (paymentMethod === 'cash' && (!amountPaid || change < 0)) || (paymentMethod === 'online' && !department)} className="w-full" size="lg">
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
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Amount Paid</span>
                    <span>₱{parseFloat(amountPaid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>₱{change.toFixed(2)}</span>
                  </div>
                </>
              )}
              {paymentMethod === 'ewallet' && (
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>{eWalletType.toUpperCase()}</span>
                </div>
              )}
              {paymentMethod === 'online' && (
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>Online</span>
                </div>
              )}
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
