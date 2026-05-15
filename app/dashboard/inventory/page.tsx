"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, PackagePlus, Package, Filter, X, ArrowUpDown, AlertCircle, TrendingUp, Warehouse, Tag, Loader2, LayoutGrid, LayoutList, Eye, ShoppingCart, Check, Building2, FileDown, FileSpreadsheet, ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import * as XLSX from 'xlsx'
import type { InventoryItem } from "@/lib/types"
import { AddItemDialog } from "@/components/add-item-dialog"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { CreateBundleDialog } from "@/components/create-bundle-dialog"
import { formatNumber, formatCurrency, cn } from "@/lib/utils"
import { showSuccess, showError } from "@/lib/toast-utils"
import type { Store } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { apiGet, apiDelete, apiPost, apiPut } from "@/lib/api-client"
import { getCurrentUserRole } from '@/lib/role-utils'
import { toast } from 'sonner'

const SALES_CHANNELS = ['Shopee', 'Lazada', 'Facebook', 'TikTok', 'Physical Store'] as const

import { PremiumTableLoading } from "@/components/premium-loading"
import { BrandLoader } from '@/components/ui/brand-loader'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState("")
  const [salesChannelFilter, setSalesChannelFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState(0)
  const [restockReason, setRestockReason] = useState("")
  
  // Get current user for role-based features
  const currentUser = getCurrentUser()
  
  // Role detection for export button
  const userRole = getCurrentUserRole()
  const isTeamLeader = false // Team leader role removed
  
  // Category Management
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{id: string, name: string, createdAt: string}>>([])
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  
  // Store Management (renamed from Warehouse Management)
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [newStore, setNewStore] = useState({ name: "", salesChannel: "" })
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [editStoreValue, setEditStoreValue] = useState({ name: "", salesChannel: "" })
  const [submitting, setSubmitting] = useState(false)
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid') // Add view mode toggle
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()) // Bulk selection
  
  // Calculate initial column widths based on viewport
  const getInitialColumnWidths = () => {
    if (typeof window === 'undefined') {
      return {
        product: 350,
        category: 220,
        status: 120,
        stock: 130,
        cost: 130,
        price: 130,
        margin: 120,
        actions: 150
      }
    }
    
    // Get available width (viewport - sidebar - scrollbar)
    const viewportWidth = window.innerWidth
    const sidebarWidth = 192 // Sidebar width (w-48 = 192px)
    const scrollbarWidth = 17 // Typical scrollbar width
    const availableWidth = viewportWidth - sidebarWidth - scrollbarWidth
    
    // Base ratios for proportional distribution (removed salesChannel and store)
    const ratios = {
      product: 350,
      category: 220,
      status: 120,
      stock: 130,
      cost: 130,
      price: 130,
      margin: 120,
      actions: 150
    }
    
    const totalRatio = Object.values(ratios).reduce((a, b) => a + b, 0)
    const scale = availableWidth / totalRatio
    
    // Calculate widths and distribute any remainder to avoid dead space
    const widths = Object.entries(ratios).reduce((acc, [key, ratio], index, arr) => {
      if (index === arr.length - 1) {
        // Last column gets the remainder to fill exactly
        const usedWidth = Object.values(acc).reduce((a, b) => a + b, 0)
        acc[key] = availableWidth - usedWidth
      } else {
        acc[key] = Math.floor(ratio * scale)
      }
      return acc
    }, {} as Record<string, number>)
    
    return widths as typeof ratios
  }
  
  // Resizable columns state - Persistent via localStorage
  const [columnWidths, setColumnWidths] = useState(() => {
    // Try to load saved column widths from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventory-column-widths')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved column widths:', e)
        }
      }
    }
    
    // Default widths if no saved data (removed salesChannel and store)
    return {
      product: 350,
      category: 220,
      status: 120,
      stock: 130,
      cost: 130,
      price: 130,
      margin: 120,
      actions: 150
    }
  })
  const [resizing, setResizing] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  
  // Delete confirmation modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null)
  const [createBundleOpen, setCreateBundleOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Handle column resize
  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    setResizing(column)
    setStartX(e.clientX)
    setStartWidth(columnWidths[column as keyof typeof columnWidths])
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return
      
      const diff = e.clientX - startX
      const newWidth = Math.max(80, startWidth + diff) // Minimum 80px
      
      setColumnWidths(prev => ({
        ...prev,
        [resizing]: newWidth
      }))
    }

    const handleMouseUp = () => {
      if (resizing) {
        // Save to localStorage when resize is complete
        localStorage.setItem('inventory-column-widths', JSON.stringify(columnWidths))
      }
      setResizing(null)
    }

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing, startX, startWidth, columnWidths])

  useEffect(() => {
    fetchItems()
    fetchStores()
    fetchCategories()

    // Refresh data when window regains focus (e.g., after switching tabs)
    const handleFocus = () => {
      fetchItems()
      fetchStores()
      fetchCategories()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    let filtered = items

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower)
      )
    }

    // Stock status filter
    if (salesChannelFilter === "low-stock") {
      filtered = filtered.filter((item) => item.quantity > 0 && item.quantity <= item.reorderLevel)
    } else if (salesChannelFilter === "out-of-stock") {
      filtered = filtered.filter((item) => item.quantity === 0)
    }

    // Apply sorting
    if (sortBy === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.sellingPrice - b.sellingPrice)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.sellingPrice - a.sellingPrice)
    } else if (sortBy === "stock-asc") {
      filtered.sort((a, b) => a.quantity - b.quantity)
    } else if (sortBy === "stock-desc") {
      filtered.sort((a, b) => b.quantity - a.quantity)
    }

    setFilteredItems(filtered)
  }, [search, salesChannelFilter, sortBy, items])

  async function fetchItems() {
    try {
      // Fetch from inventory table only (NOT bundles)
      // Bundles are virtual products - their items are already in inventory
      const data = await apiGet<InventoryItem[]>("/api/items")
      const itemsArray = Array.isArray(data) ? data : []
      setItems(itemsArray)
      setFilteredItems(itemsArray)
    } catch (error) {
      console.error("[Inventory] Error fetching items:", error)
      setItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStores() {
    try {
      const data = await apiGet<Store[]>("/api/stores")
      setStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
    }
  }

  async function fetchCategories() {
    try {
      const data = await apiGet<any[]>("/api/categories")
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  async function handleDelete(id: string) {
    try {
      // Check if it's a bundle (bundles have ID starting with "BUNDLE-")
      const isBundle = id.startsWith('BUNDLE-')
      const endpoint = isBundle ? `/api/bundles/${id}` : `/api/items/${id}`
      
      // Add authentication headers
      const headers = new Headers({
        'Content-Type': 'application/json'
      })
      
      const username = localStorage.getItem('username')
      const role = localStorage.getItem('userRole')
      const displayName = localStorage.getItem('displayName')
      
      if (username) headers.set('x-user-username', username)
      if (role) headers.set('x-user-role', role)
      if (displayName) headers.set('x-user-display-name', displayName)
      
      const response = await fetch(endpoint, { 
        method: "DELETE",
        headers 
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete product' }))
        throw new Error(errorData.error || 'Failed to delete product')
      }
      
      await fetchItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      showSuccess("Product deleted successfully")
    } catch (error) {
      console.error("[Inventory] Error deleting item:", error)
      showError(error instanceof Error ? error.message : "Failed to delete product")
    }
  }
  
  function openDeleteDialog(id: string, name: string) {
    setItemToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  function handleEdit(item: InventoryItem) {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  function handleRestock(item: InventoryItem) {
    setSelectedRestockItem(item)
    setRestockAmount(0)
    setRestockReason("")
    setRestockDialogOpen(true)
  }

  async function handleRestockSubmit() {
    if (!selectedRestockItem || restockAmount <= 0 || !restockReason) return

    try {
      await apiPost(`/api/items/${selectedRestockItem.id}/restock`, {
        amount: restockAmount,
        reason: restockReason
      })

      setRestockDialogOpen(false)
      setSelectedRestockItem(null)
      setRestockReason("")
      fetchItems()
      showSuccess("Item restocked successfully!")
    } catch (error) {
      console.error("[Inventory] Error restocking item:", error)
      showError("Failed to restock item")
    }
  }

  // Store Management Functions
  async function handleAddStore() {
    if (!newStore.name.trim() || !newStore.salesChannel) {
      showError("Please enter store name and select sales channel")
      return
    }

    try {
      setSubmitting(true)
      await apiPost("/api/stores", { 
        store_name: newStore.name.trim(),
        sales_channel: newStore.salesChannel 
      })
      showSuccess("Store added successfully")
      setNewStore({ name: "", salesChannel: "" })
      fetchStores()
    } catch (error) {
      console.error("Error adding store:", error)
      showError("Failed to add store")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditStore() {
    if (!editingStore || !editStoreValue.name.trim() || !editStoreValue.salesChannel) {
      showError("Please enter store name and select sales channel")
      return
    }

    try {
      setSubmitting(true)
      await apiPut(`/api/stores/${editingStore.id}`, { 
        store_name: editStoreValue.name.trim(),
        sales_channel: editStoreValue.salesChannel 
      })
      showSuccess("Store updated successfully")
      setEditingStore(null)
      setEditStoreValue({ name: "", salesChannel: "" })
      fetchStores()
    } catch (error) {
      console.error("Error updating store:", error)
      showError("Failed to update store")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteStore(id: string) {
    try {
      setSubmitting(true)
      await apiDelete(`/api/stores/${id}`)
      showSuccess("Store deleted successfully")
      setDeleteWarehouseId(null)
      fetchStores()
    } catch (error) {
      console.error("Error deleting warehouse:", error)
      showError("Failed to delete warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  // Category Management Functions
  async function handleAddCategory() {
    if (!newCategory.trim()) {
      showError("Please enter a category name")
      return
    }

    try {
      setSubmitting(true)
      const category = await apiPost("/api/categories", { name: newCategory.trim() })
      showSuccess("Category added successfully")
      setNewCategory("")
      fetchCategories()
    } catch (error) {
      console.error("Error adding category:", error)
      showError("Failed to add category")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditCategory() {
    if (!editingCategory || !editCategoryValue.trim()) {
      showError("Please enter a category name")
      return
    }

    try {
      setSubmitting(true)
      await apiPut(`/api/categories/${editingCategory.id}`, { name: editCategoryValue.trim() })
      showSuccess("Category updated successfully")
      setEditingCategory(null)
      setEditCategoryValue("")
      fetchCategories()
    } catch (error) {
      console.error("Error updating category:", error)
      showError("Failed to update category")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      setSubmitting(true)
      await apiDelete(`/api/categories/${id}`)
      showSuccess("Category deleted successfully")
      setDeleteCategoryId(null)
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      showError("Failed to delete category")
    } finally {
      setSubmitting(false)
    }
  }

  // Export Functions
  const exportToExcel = async () => {
    try {
      // Filter out bundles - only export regular items
      const regularItems = filteredItems.filter(item => (item as any).product_type !== 'bundle')
      
      // Fetch restock data for all items
      const restockResponse = await fetch('/api/restocks')
      const allRestocks = restockResponse.ok ? await restockResponse.json() : []
      
      // Group items by product name + cost price + selling price
      const groupedItems = regularItems.reduce((acc, item) => {
        // Create unique key based on name, cost, and selling price
        const key = `${item.name}-${item.costPrice}-${item.sellingPrice}`
        
        if (!acc[key]) {
          acc[key] = {
            name: item.name,
            quantity: 0,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            items: []
          }
        }
        
        acc[key].quantity += item.quantity
        acc[key].items.push(item)
        
        return acc
      }, {} as Record<string, any>)
      
      // Add restock information to each group
      Object.values(groupedItems).forEach((group: any) => {
        // Find the most recent restock for any item in this group
        const itemIds = group.items.map((i: any) => i.id)
        const groupRestocks = allRestocks.filter((r: any) => itemIds.includes(r.itemId))
        
        if (groupRestocks.length > 0) {
          // Sort by timestamp descending to get the most recent
          const latestRestock = groupRestocks.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
          
          group.lastRestockDate = latestRestock.timestamp
          group.lastRestockAmount = latestRestock.quantity
          group.lastRestockReason = latestRestock.reason
        } else {
          group.lastRestockDate = 'N/A'
          group.lastRestockAmount = 'N/A'
          group.lastRestockReason = 'N/A'
        }
      })

      const groupedArray = Object.values(groupedItems)

      // Calculate totals for header
      const totalProducts = groupedArray.length
      const totalQuantity = groupedArray.reduce((sum: number, group: any) => sum + group.quantity, 0)
      const totalValue = groupedArray.reduce((sum: number, group: any) => sum + (group.quantity * group.sellingPrice), 0)
      const totalCOGS = groupedArray.reduce((sum: number, group: any) => sum + (group.quantity * group.costPrice), 0)
      
      let lowStockCount = 0
      let outOfStockCount = 0
      groupedArray.forEach((group: any) => {
        const lowestReorderLevel = Math.min(...group.items.map((i: any) => i.reorderLevel || 0))
        if (group.quantity === 0) {
          outOfStockCount++
        } else if (group.quantity <= lowestReorderLevel) {
          lowStockCount++
        }
      })
      const inStockCount = totalProducts - lowStockCount - outOfStockCount

      // Create header information
      const headerInfo = [
        ['INVENTORY REPORT'],
        [''],
        ['Report Date:', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
        ['Report Time:', new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
        [''],
        ['SUMMARY INFORMATION'],
        ['Total Products:', `${totalProducts} items`],
        ['Total Quantity:', `${formatNumber(totalQuantity)} units`],
        ['Total Inventory Value:', formatCurrency(totalValue)],
        ['Total COGS:', formatCurrency(totalCOGS)],
        ['In Stock Items:', `${inStockCount} items`],
        ['Low Stock Items:', `${lowStockCount} items`],
        ['Out of Stock Items:', `${outOfStockCount} items`],
        ['Filter Applied:', salesChannelFilter !== 'all' ? salesChannelFilter : 'All Channels'],
        [''],
        ['Note: Bundle items are excluded from this report'],
        [''],
        ['']
      ]

      // Convert grouped data to export format
      const exportData = groupedArray.map((group: any) => {
        const totalValue = group.quantity * group.sellingPrice
        const totalCOGS = group.quantity * group.costPrice
        const profitMargin = group.sellingPrice > 0 
          ? ((group.sellingPrice - group.costPrice) / group.sellingPrice * 100).toFixed(2)
          : '0.00'
        
        // Determine status based on total quantity
        const lowestReorderLevel = Math.min(...group.items.map((i: any) => i.reorderLevel || 0))
        const status = group.quantity === 0 
          ? 'Out of Stock' 
          : group.quantity <= lowestReorderLevel 
            ? 'Low Stock' 
            : 'In Stock'
        
        // Format restock date if available
        const restockDate = group.lastRestockDate !== 'N/A' 
          ? new Date(group.lastRestockDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : 'N/A'
        
        // Format restock reason
        const restockReason = group.lastRestockReason !== 'N/A'
          ? group.lastRestockReason.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'N/A'

        return {
          'Product Name': group.name,
          'Quantity': group.quantity,
          'Cost Price': formatCurrency(group.costPrice),
          'Selling Price': formatCurrency(group.sellingPrice),
          'Profit Margin': `${profitMargin}%`,
          'Total Value': formatCurrency(totalValue),
          'Total COGS': formatCurrency(totalCOGS),
          'Status': status,
          'Last Restock Date': restockDate,
          'Last Restock Amount': group.lastRestockAmount,
          'Restock Reason': restockReason
        }
      })

      // Create workbook and add header
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(headerInfo)
      
      // Add data table below header
      XLSX.utils.sheet_add_json(ws, exportData, { origin: -1, skipHeader: false })
      
      // Style the header section (make first row bold)
      if (!ws['!rows']) ws['!rows'] = []
      ws['!rows'][0] = { hpt: 20, hpx: 20 }
      
      // Auto-size columns
      const maxWidth = 50
      const allData = [...headerInfo.map(row => row.join(' ')), ...exportData.map(row => Object.values(row).join(' '))]
      const colCount = Math.max(...headerInfo.map(row => row.length), Object.keys(exportData[0] || {}).length)
      const colWidths = Array(colCount).fill(0).map((_, i) => {
        const maxLen = Math.max(
          ...headerInfo.map(row => String(row[i] || '').length),
          ...exportData.map(row => String(Object.values(row)[i] || '').length)
        )
        return { wch: Math.min(maxLen + 2, maxWidth) }
      })
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Inventory')

      const fileName = `Inventory-Report-${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Excel report downloaded successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export Excel report')
    }
  }

  const exportToPDF = async () => {
    try {
      // Filter out bundles - only export regular items
      const regularItems = filteredItems.filter(item => (item as any).product_type !== 'bundle')
      
      // Fetch restock data for all items
      const restockResponse = await fetch('/api/restocks')
      const allRestocks = restockResponse.ok ? await restockResponse.json() : []
      
      // Group items by product name + cost price + selling price
      const groupedItems = regularItems.reduce((acc, item) => {
        // Create unique key based on name, cost, and selling price
        const key = `${item.name}-${item.costPrice}-${item.sellingPrice}`
        
        if (!acc[key]) {
          acc[key] = {
            name: item.name,
            quantity: 0,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            items: []
          }
        }
        
        acc[key].quantity += item.quantity
        acc[key].items.push(item)
        
        return acc
      }, {} as Record<string, any>)
      
      // Add restock information to each group
      Object.values(groupedItems).forEach((group: any) => {
        // Find the most recent restock for any item in this group
        const itemIds = group.items.map((i: any) => i.id)
        const groupRestocks = allRestocks.filter((r: any) => itemIds.includes(r.itemId))
        
        if (groupRestocks.length > 0) {
          // Sort by timestamp descending to get the most recent
          const latestRestock = groupRestocks.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
          
          group.lastRestockDate = latestRestock.timestamp
          group.lastRestockAmount = latestRestock.quantity
          group.lastRestockReason = latestRestock.reason
        } else {
          group.lastRestockDate = 'N/A'
          group.lastRestockAmount = 'N/A'
          group.lastRestockReason = 'N/A'
        }
      })

      const groupedArray = Object.values(groupedItems)

      // Calculate totals
      const totalProducts = groupedArray.length
      const totalQuantity = groupedArray.reduce((sum: number, group: any) => sum + group.quantity, 0)
      const totalValue = groupedArray.reduce((sum: number, group: any) => sum + (group.quantity * group.sellingPrice), 0)
      const totalCOGS = groupedArray.reduce((sum: number, group: any) => sum + (group.quantity * group.costPrice), 0)
      
      // Count low stock and out of stock
      let lowStockCount = 0
      let outOfStockCount = 0
      groupedArray.forEach((group: any) => {
        const lowestReorderLevel = Math.min(...group.items.map((i: any) => i.reorderLevel || 0))
        if (group.quantity === 0) {
          outOfStockCount++
        } else if (group.quantity <= lowestReorderLevel) {
          lowStockCount++
        }
      })

      // Create printable HTML
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Please allow popups to export PDF')
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #1e293b; margin: 0 0 10px 0; font-size: 32px; }
            .report-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; }
            .info-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 6px; }
            .info-label { color: #64748b; font-size: 13px; font-weight: 600; }
            .info-value { color: #1e293b; font-size: 13px; font-weight: 700; }
            .meta { color: #64748b; margin-bottom: 20px; font-size: 14px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
            .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 12px; text-transform: uppercase; }
            td { font-size: 14px; color: #1e293b; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            .status-in-stock { background-color: #dcfce7; color: #166534; }
            .status-low-stock { background-color: #fef3c7; color: #92400e; }
            .status-out-of-stock { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .header { page-break-inside: avoid; }
              .summary { page-break-inside: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory Report</h1>
            <div class="report-info">
              <div class="info-item">
                <span class="info-label">Report Date:</span>
                <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Report Time:</span>
                <span class="info-value">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Products:</span>
                <span class="info-value">${totalProducts} items</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Quantity:</span>
                <span class="info-value">${formatNumber(totalQuantity)} units</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Inventory Value:</span>
                <span class="info-value">${formatCurrency(totalValue)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total COGS:</span>
                <span class="info-value">${formatCurrency(totalCOGS)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">In Stock Items:</span>
                <span class="info-value">${totalProducts - lowStockCount - outOfStockCount} items</span>
              </div>
              <div class="info-item">
                <span class="info-label">Low Stock Items:</span>
                <span class="info-value">${lowStockCount} items</span>
              </div>
              <div class="info-item">
                <span class="info-label">Out of Stock Items:</span>
                <span class="info-value">${outOfStockCount} items</span>
              </div>
              <div class="info-item">
                <span class="info-label">Filter Applied:</span>
                <span class="info-value">${salesChannelFilter !== 'all' ? salesChannelFilter : 'All Channels'}</span>
              </div>
            </div>
            <p style="margin-top: 15px; color: #64748b; font-size: 12px; font-style: italic;">
              Note: Bundle items are excluded from this report
            </p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Products</h3>
              <p>${totalProducts}</p>
            </div>
            <div class="summary-card">
              <h3>Total Quantity</h3>
              <p>${formatNumber(totalQuantity)}</p>
            </div>
            <div class="summary-card">
              <h3>Total Value</h3>
              <p>${formatCurrency(totalValue)}</p>
            </div>
            <div class="summary-card">
              <h3>Total COGS</h3>
              <p>${formatCurrency(totalCOGS)}</p>
            </div>
            <div class="summary-card">
              <h3>Low Stock Items</h3>
              <p>${lowStockCount}</p>
            </div>
            <div class="summary-card">
              <h3>Out of Stock</h3>
              <p>${outOfStockCount}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Profit Margin</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Last Restock</th>
                <th>Restock Qty</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              ${groupedArray.map((group: any) => {
                const totalValue = group.quantity * group.sellingPrice
                const profitMargin = group.sellingPrice > 0 
                  ? ((group.sellingPrice - group.costPrice) / group.sellingPrice * 100).toFixed(2)
                  : '0.00'
                
                const lowestReorderLevel = Math.min(...group.items.map((i: any) => i.reorderLevel || 0))
                const status = group.quantity === 0 
                  ? 'Out of Stock' 
                  : group.quantity <= lowestReorderLevel 
                    ? 'Low Stock' 
                    : 'In Stock'
                const statusClass = group.quantity === 0 
                  ? 'status-out-of-stock' 
                  : group.quantity <= lowestReorderLevel 
                    ? 'status-low-stock' 
                    : 'status-in-stock'
                
                // Format restock date
                const restockDate = group.lastRestockDate !== 'N/A' 
                  ? new Date(group.lastRestockDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : 'N/A'
                
                // Format restock reason
                const restockReason = group.lastRestockReason !== 'N/A'
                  ? group.lastRestockReason.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  : 'N/A'
                
                return `
                  <tr>
                    <td>${group.name}</td>
                    <td>${group.quantity}</td>
                    <td>${formatCurrency(group.costPrice)}</td>
                    <td>${formatCurrency(group.sellingPrice)}</td>
                    <td>${profitMargin}%</td>
                    <td>${formatCurrency(totalValue)}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${restockDate}</td>
                    <td>${group.lastRestockAmount}</td>
                    <td>${restockReason}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
        toast.success('PDF export ready')
      }, 250)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('Failed to export PDF report')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading inventory...
          </p>
        </div>
      </div>
    )
  }

  // Extract unique category names for filter
  const categoryNames = categories.map(cat => cat.name)

  const activeFiltersCount = [
    salesChannelFilter !== "all",
    search !== ""
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSearch("")
    setSalesChannelFilter("all")
    setSortBy("name-asc")
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-4 pb-6 px-0 md:pt-6 md:px-0">
      {/* Page Header - Mobile Optimized */}
      <div className="mb-5 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
              Inventory Management
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Comprehensive product inventory control and management
            </p>
          </div>
          
          {/* Export Button - Admin only - Professional SaaS Style */}
          {!isTeamLeader && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative h-11 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-semibold group overflow-hidden"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-2.5">
                    <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
                      <FileDown className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Export Report</span>
                    <ChevronDown className="h-4 w-4 ml-1 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl"
              >
                <DropdownMenuItem 
                  onClick={exportToPDF}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Export as PDF</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Print-ready format</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={exportToExcel}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group mt-1"
                >
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Export as Excel</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Editable spreadsheet</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="px-4">
      {/* Professional Search & Actions Bar */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Enhanced Search Bar - Left */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search products by name, category, or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-12 text-[15px] border-slate-300 dark:border-slate-700 rounded-lg w-full bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Professional Action Buttons - Right */}
              <div className="flex gap-2.5 flex-wrap lg:flex-nowrap">
                <Button
                  onClick={() => setCategoryDialogOpen(true)}
                  className="flex-1 lg:flex-none h-12 px-5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg text-[14px] font-semibold whitespace-nowrap transition-all duration-200 rounded-lg"
                >
                  <Plus className="h-[18px] w-[18px] mr-2" />
                  Categories
                </Button>

                <Button
                  onClick={() => setStoreDialogOpen(true)}
                  className="flex-1 lg:flex-none h-12 px-5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg text-[14px] font-semibold whitespace-nowrap transition-all duration-200 rounded-lg"
                >
                  <Plus className="h-[18px] w-[18px] mr-2" />
                  Stores
                </Button>

                <Button
                  onClick={() => setCreateBundleOpen(true)}
                  className="flex-1 lg:flex-none h-12 px-5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg text-[14px] font-semibold whitespace-nowrap transition-all duration-200 rounded-lg"
                >
                  <Plus className="h-[18px] w-[18px] mr-2" />
                  Bundle
                </Button>

                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="flex-1 lg:flex-none h-12 px-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg text-[14px] font-semibold whitespace-nowrap transition-all duration-200 rounded-lg"
                >
                  <Plus className="h-[18px] w-[18px] mr-2" />
                  Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters + Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 ? (
              <>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs px-2.5 py-1 font-medium">
                  {activeFiltersCount} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              </>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">No filters</span>
            )}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span>
            <span className="mx-1 text-slate-400">of</span>
            <span className="font-semibold">{items.length}</span>
          </div>
        </div>
      </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-none md:rounded-lg overflow-hidden">
        <CardHeader className="pb-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-4 px-4 md:px-6">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span>Product Inventory</span>
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "h-8 px-3 rounded-md transition-all",
                      viewMode === 'grid'
                        ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={cn(
                      "h-8 px-3 rounded-md transition-all",
                      viewMode === 'table'
                        ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 border-0 text-sm px-3 py-1.5 font-bold shadow-sm">
                  {filteredItems.length} items
                </Badge>
              </div>
            </div>
            
            {/* Stats Row - 3 Cards with Professional Corporate Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Total Quantity - Blue Gradient (Excludes Bundles) */}
              <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Quantity</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent tabular-nums mb-2">
                    {formatNumber(Array.isArray(items) ? items.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + item.quantity, 0) : 0)}
                  </p>
                  {(search || salesChannelFilter !== "all") && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filtered: {formatNumber(Array.isArray(filteredItems) ? filteredItems.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + item.quantity, 0) : 0)}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Value - Green Gradient (Excludes Bundles) */}
              <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Value</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent tabular-nums mb-2">
                    {formatCurrency(Array.isArray(items) ? items.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0) : 0)}
                  </p>
                  {(search || salesChannelFilter !== "all") && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filtered: {formatCurrency(Array.isArray(filteredItems) ? filteredItems.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0) : 0)}
                    </p>
                  )}
                </div>
              </div>

              {/* Total COGS - Orange Gradient (Excludes Bundles) */}
              <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total COGS</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent tabular-nums mb-2">
                    {formatCurrency(Array.isArray(items) ? items.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + (item.totalCOGS || (item.costPrice * item.quantity)), 0) : 0)}
                  </p>
                  {(search || salesChannelFilter !== "all") && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filtered: {formatCurrency(Array.isArray(filteredItems) ? filteredItems.filter(item => item.productType !== 'bundle').reduce((sum, item) => sum + (item.totalCOGS || (item.costPrice * item.quantity)), 0) : 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!Array.isArray(filteredItems) || filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                <Package className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {search || salesChannelFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first product"}
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                /* Grid View - Professional Layout */
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                    {filteredItems.map((item) => {
                      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0
                      const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
                      const isOutOfStock = item.quantity === 0
                      const isSelected = selectedItems.has(item.id)
                      const isBundle = (item as any).product_type === 'bundle'
                      
                      return (
                        <Card
                          key={item.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300 cursor-pointer border",
                            isSelected
                              ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 shadow-lg"
                              : "border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1"
                          )}
                          onClick={() => {
                            const newSelected = new Set(selectedItems)
                            if (isSelected) {
                              newSelected.delete(item.id)
                            } else {
                              newSelected.add(item.id)
                            }
                            setSelectedItems(newSelected)
                          }}
                        >
                          {/* Stock Badge - Fixed Position */}
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold px-2.5 py-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                              {item.quantity}
                            </Badge>
                          </div>

                          {/* Bundle Badge - NEW */}
                          {isBundle && (
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 shadow-sm border border-purple-200 dark:border-purple-800">
                                BUNDLE
                              </Badge>
                            </div>
                          )}

                          {/* Status Badge - Fixed Position */}
                          {(isOutOfStock || isLowStock) && !isBundle && (
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className={cn(
                                "text-[10px] font-bold px-2 py-0.5 shadow-sm",
                                isOutOfStock
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              )}>
                                {isOutOfStock ? "OUT" : "LOW"}
                              </Badge>
                            </div>
                          )}

                          <CardContent className="p-5 pt-12">
                            {/* Product Name - Fixed Height */}
                            <div className="mb-4 h-16">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                                {item.category}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                                  {formatCurrency(item.sellingPrice)}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 line-through">
                                  {formatCurrency(item.costPrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 border border-green-200 dark:border-green-800">
                                  {profitMargin.toFixed(0)}% margin
                                </Badge>
                              </div>
                            </div>

                            {/* Stock Info */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Stock Level</span>
                                <span className="font-bold text-slate-900 dark:text-white text-lg">{item.quantity} units</span>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            {getCurrentUser()?.role === 'admin' && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit(item)
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRestock(item)
                                  }}
                                >
                                  <PackagePlus className="h-3.5 w-3.5 mr-1.5" />
                                  Restock
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Table View */
                <>
              {/* Mobile Scroll Hint - Enhanced */}
              <div className="md:hidden px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 font-medium">
                  <span className="text-blue-500">←</span>
                  <span>Swipe to see all columns • Tap row to highlight</span>
                  <span className="text-blue-500">→</span>
                </p>
              </div>

              {/* Desktop Resize Hint */}
              <div className="hidden md:block px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 font-medium">
                  <span>💡</span>
                  <span>Drag column borders to resize • Expand Product column to see full names</span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm table-fixed">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black">
                      <th className="py-2.5 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[25%]">
                        Product
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'product')}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-left text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[15%]">
                        Category
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'category')}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[10%]">
                        Status
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'status')}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[10%]">
                        Stock
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'stock')}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-right text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[10%]">
                        Cost
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'cost')}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-right text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[10%]">
                        Price
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'price')}
                        />
                      </th>
                      <th className="py-2.5 px-3 pr-6 text-right text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 relative w-[10%]">
                        Margin
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                          onMouseDown={(e) => handleMouseDown(e, 'margin')}
                        />
                      </th>
                      {getCurrentUser()?.role === 'admin' && (
                        <th className="py-2.5 px-3 text-center text-[10px] font-bold text-white uppercase tracking-wider w-[10%]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredItems.map((item) => {
                      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0
                      const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
                      const isOutOfStock = item.quantity === 0
                      const stockPercentage = Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100)
                      const isSelected = selectedRowId === item.id
                      const isBundle = (item as any).productType === 'bundle' || (item as any).product_type === 'bundle'
                      
                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedRowId(isSelected ? null : item.id)}
                          className={
                            isSelected
                              ? "transition-all duration-200 cursor-pointer bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400 ring-inset"
                              : "transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          }
                        >
                          {/* Product Name */}
                          <td className="py-2 px-3 w-[25%]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p 
                                  className={cn(
                                    "text-xs font-semibold break-words line-clamp-2",
                                    isSelected 
                                      ? "text-blue-900 dark:text-blue-100" 
                                      : "text-slate-900 dark:text-white"
                                  )}
                                  title={item.name}
                                >
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-2 px-3 w-[15%]">
                            <span 
                              className={cn(
                                "text-xs block break-words",
                                isSelected 
                                  ? "text-blue-900 dark:text-blue-100 font-medium" 
                                  : "text-slate-600 dark:text-slate-400"
                              )}
                              title={item.category}
                            >
                              {item.category}
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-2 px-3 text-center w-[10%]">
                            <div className="flex justify-center">
                              {isOutOfStock ? (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 text-xs px-1.5 py-0.5">
                                  Out
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs px-1.5 py-0.5">
                                  Low
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-xs px-1.5 py-0.5">
                                  OK
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Stock with Progress */}
                          <td className="py-2 px-3 w-[10%]">
                            <div className="flex flex-col items-end gap-1">
                              <span className={
                                isSelected 
                                  ? "text-xs font-bold tabular-nums text-blue-900 dark:text-blue-100" 
                                  : "text-xs font-bold tabular-nums text-slate-900 dark:text-white"
                              }>
                                {formatNumber(item.quantity)}
                              </span>
                              <div className="w-full max-w-[60px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    isOutOfStock ? 'bg-red-500' :
                                    isLowStock ? 'bg-amber-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${stockPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-2 px-3 text-right w-[10%]">
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                              {formatCurrency(item.costPrice)}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-2 px-3 text-right w-[10%]">
                            <span className={
                              isSelected 
                                ? "text-xs font-semibold tabular-nums text-blue-900 dark:text-blue-100" 
                                : "text-xs font-semibold tabular-nums text-slate-900 dark:text-white"
                            }>
                              {formatCurrency(item.sellingPrice)}
                            </span>
                          </td>

                          {/* Profit Margin */}
                          <td className="py-2 px-3 pr-6 w-[10%]">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`text-xs font-bold tabular-nums ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                                {profitMargin.toFixed(1)}%
                              </span>
                            </div>
                          </td>

                          {/* Actions - Admin only */}
                          <td className="py-2 px-3 w-[10%]">
                            {getCurrentUser()?.role === 'admin' && (
                              <TooltipProvider>
                                <div className="flex justify-center gap-0.5">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRestock(item)
                                        }}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-9 w-9 p-0"
                                      >
                                        <PackagePlus className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Restock</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEdit(item)
                                        }}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9 w-9 p-0"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openDeleteDialog(item.id, item.name)
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9 p-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}

      <AddItemDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={fetchItems} />

      <CreateBundleDialog open={createBundleOpen} onOpenChange={setCreateBundleOpen} onSuccess={fetchItems} />

      {selectedItem && (
        <EditItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
          onSuccess={fetchItems}
        />
      )}

      {selectedRestockItem && (
        <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Restock {selectedRestockItem.name}</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Enter the amount to add to the current stock of {selectedRestockItem.quantity}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="restock-amount" className="text-slate-700 dark:text-slate-300 font-medium">Amount to Restock</Label>
                <Input
                  id="restock-amount"
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <Label htmlFor="restock-reason" className="text-slate-700 dark:text-slate-300 font-medium">Reason for Restock</Label>
                <Select value={restockReason} onValueChange={setRestockReason}>
                  <SelectTrigger id="restock-reason" className="rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="new-stock">New Stock Arrival</SelectItem>
                    <SelectItem value="damaged-return">Damaged Item Return</SelectItem>
                    <SelectItem value="supplier-return">Supplier Return</SelectItem>
                    <SelectItem value="inventory-adjustment">Inventory Adjustment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleRestockSubmit} disabled={restockAmount <= 0 || !restockReason} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Restock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Category Management Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-600" />
              Category Management
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Add and manage product categories
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar]:opacity-0 hover:[&::-webkit-scrollbar]:opacity-100 transition-opacity">
            {/* Add New Category Section - More Prominent */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add New Category</h3>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Category Name *
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCategory.trim()) {
                        handleAddCategory()
                      }
                    }}
                    className="h-10 text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    disabled={submitting}
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim() || submitting}
                    size="sm"
                    className="h-10 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Categories List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 px-1">
                Existing Categories ({categories.length})
              </h3>

            {/* Category List */}
            {categories.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Tag className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No categories yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Add your first category using the form above</p>
              </div>
            ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditCategory()
                          }
                          if (e.key === "Escape") {
                            setEditingCategory(null)
                            setEditCategoryValue("")
                          }
                        }}
                        className="h-9 text-sm flex-1"
                        disabled={submitting}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleEditCategory}
                        disabled={submitting || !editCategoryValue.trim()}
                        className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white text-sm whitespace-nowrap"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null)
                          setEditCategoryValue("")
                        }}
                        disabled={submitting}
                        className="h-9 px-4 text-sm whitespace-nowrap"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Tag className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category)
                            setEditCategoryValue(category.name)
                          }}
                          disabled={submitting}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCategoryId(category.id)}
                          disabled={submitting}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Store Management Dialog */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-orange-600" />
              Store Management
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Add and manage stores organized by sales channel
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar]:opacity-0 hover:[&::-webkit-scrollbar]:opacity-100 transition-opacity">
            {/* Add New Store Section - More Prominent */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add New Store</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Sales Channel *
                  </Label>
                  <Select 
                    value={newStore.salesChannel} 
                    onValueChange={(value) => setNewStore({ ...newStore, salesChannel: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-10 text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                      <SelectValue placeholder="Choose a sales channel" />
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
                
                <div>
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Store Name *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter store name"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAddStore()}
                      disabled={submitting}
                      className="h-10 text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <Button
                      onClick={handleAddStore}
                      disabled={!newStore.name.trim() || !newStore.salesChannel || submitting}
                      size="sm"
                      className="h-10 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Stores List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 px-1">
                Existing Stores ({stores.length})
              </h3>

            {/* Store List */}
            {stores.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <Warehouse className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No stores yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Add your first store using the form above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {SALES_CHANNELS.map((channel) => {
                  const channelStores = stores.filter(s => s.sales_channel === channel)
                  if (channelStores.length === 0) return null
                  
                  return (
                    <div key={channel} className="space-y-2">
                      <div className="flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {channel} ({channelStores.length})
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                      </div>
                      {channelStores.map((store) => (
                        <div
                          key={store.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                        >
                          {editingStore?.id === store.id ? (
                            <div className="flex-1 space-y-2">
                              <Select 
                                value={editStoreValue.salesChannel} 
                                onValueChange={(value) => setEditStoreValue({ ...editStoreValue, salesChannel: value })}
                                disabled={submitting}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SALES_CHANNELS.map((ch) => (
                                    <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Input
                                  value={editStoreValue.name}
                                  onChange={(e) => setEditStoreValue({ ...editStoreValue, name: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleEditStore()
                                    if (e.key === "Escape") {
                                      setEditingStore(null)
                                      setEditStoreValue({ name: "", salesChannel: "" })
                                    }
                                  }}
                                  disabled={submitting}
                                  className="h-8 text-xs flex-1"
                                  autoFocus
                                />
                                <Button
                                  onClick={handleEditStore}
                                  disabled={!editStoreValue.name.trim() || !editStoreValue.salesChannel || submitting}
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingStore(null)
                                    setEditStoreValue({ name: "", salesChannel: "" })
                                  }}
                                  disabled={submitting}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">
                                {store.store_name}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingStore(store)
                                    setEditStoreValue({ name: store.store_name, salesChannel: store.sales_channel })
                                  }}
                                  disabled={submitting}
                                  className="h-7 w-7 p-0 text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteWarehouseId(store.id)}
                                  disabled={submitting}
                                  className="h-7 w-7 p-0 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Store Confirmation */}
      <Dialog open={!!deleteWarehouseId} onOpenChange={() => setDeleteWarehouseId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Delete Store</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this store? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteWarehouseId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteWarehouseId && handleDeleteStore(deleteWarehouseId)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl font-semibold">Delete Category</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryId(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enterprise-Grade Delete Product Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-600 dark:text-slate-400 space-y-3 py-4">
            <div className="font-medium">Are you sure you want to delete this product?</div>
            {itemToDelete && (
              <div className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg font-mono">
                {itemToDelete.name}
              </div>
            )}
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ This action cannot be undone
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              className="w-40 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => itemToDelete && handleDelete(itemToDelete.id)}
              className="w-40 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
