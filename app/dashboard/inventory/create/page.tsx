"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import type { InventoryItem } from "@/lib/types"

export default function CreateProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderLevel: 0,
    supplier: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Price") || name.includes("quantity") || name.includes("Level") 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lastUpdated: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || "Failed to create product")
        return
      }

      router.push("/inventory")
      router.refresh() // Refresh the inventory page to show new item
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/inventory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Create New Product</h1>
        <p className="text-muted-foreground">Add a new product to your inventory</p>
      </div>

      <Card className="bg-gradient-to-br from-black via-black/50 to-gray-900 border-border max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>

            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="Enter category"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  required
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₱)</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (₱)</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
