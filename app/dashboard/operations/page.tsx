"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, AlertTriangle, ShoppingCart, Users, PackageX, TrendingUp, ArrowRight, RefreshCw } from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import type { InventoryItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function OperationsDashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/items")
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate metrics
  const totalItems = items.length
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel)
  const outOfStockItems = items.filter(item => item.quantity === 0)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Operations Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">Quick overview of inventory and operations</p>
        </div>
        <Button
          onClick={fetchData}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/pos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 dark:border-blue-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouse Dispatch</CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Start POS</div>
              <p className="text-xs text-muted-foreground mt-1">Process sales & dispatch</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Inventory</CardTitle>
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <AnimatedNumber value={totalItems} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total products</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/customers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground mt-1">Customer management</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={totalQuantity} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Units in stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card className={cn(
          "border-2",
          lowStockItems.length > 0 ? "border-amber-200 dark:border-amber-900" : ""
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Low Stock Items
              </CardTitle>
              <Badge variant={lowStockItems.length > 0 ? "default" : "secondary"} className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {lowStockItems.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-[5px] bg-amber-50 dark:bg-amber-900/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {item.quantity} left
                    </Badge>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Link href="/dashboard/inventory/low-stock">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {lowStockItems.length} items
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All items are well stocked</p>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock Alert */}
        <Card className={cn(
          "border-2",
          outOfStockItems.length > 0 ? "border-red-200 dark:border-red-900" : ""
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageX className="h-5 w-5 text-red-600" />
                Out of Stock
              </CardTitle>
              <Badge variant={outOfStockItems.length > 0 ? "destructive" : "secondary"}>
                {outOfStockItems.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {outOfStockItems.length > 0 ? (
              <div className="space-y-2">
                {outOfStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-[5px] bg-red-50 dark:bg-red-900/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      0 stock
                    </Badge>
                  </div>
                ))}
                {outOfStockItems.length > 5 && (
                  <Link href="/dashboard/inventory/out-of-stock">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {outOfStockItems.length} items
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No items out of stock</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Low Stock Alert:</strong> {lowStockItems.length} items need restocking soon.
              </AlertDescription>
            </Alert>
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Inventory Check:</strong> Regular stock counts help maintain accuracy.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
