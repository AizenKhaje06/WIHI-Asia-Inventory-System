"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { 
  BarChart3, Package, TrendingUp, 
  FileSpreadsheet, FileDown, ChevronRight, CheckCircle2, XCircle, RotateCcw, Clock, AlertCircle, User
} from "lucide-react"
import type { SalesReport } from "@/lib/types"
import { toast } from "sonner"
import { formatNumber, formatCurrency, cn } from "@/lib/utils"
import { apiGet } from "@/lib/api-client"
import { getCurrentUser } from "@/lib/auth"
import { 
  exportToExcel, 
  exportToPDF,
  formatCurrencyForExport,
  formatDateForExport,
  formatNumberForExport,
  formatPercentageForExport
} from "@/lib/export-utils"

// Helper function for status badges
function getStatusBadge(status: string = 'completed') {
  const styles = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  
  const icons = {
    completed: CheckCircle2,
    cancelled: XCircle,
    returned: RotateCcw,
    pending: Clock,
  }
  
  const Icon = icons[status as keyof typeof icons] || CheckCircle2
  const style = styles[status as keyof typeof styles] || styles.completed
  
  return (
    <Badge className={cn("text-[10px] px-1.5 py-0.5 font-medium", style)}>
      <Icon className="h-2.5 w-2.5 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [reportType, setReportType] = useState("executive")
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all") // NEW: Status filter
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  
  // Cancel transaction dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelNotes, setCancelNotes] = useState("")
  const [cancelling, setCancelling] = useState(false)
  // Customer information for cancelled orders
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  
  const currentUser = getCurrentUser()

  useEffect(() => {
    loadAllData()
  }, [startDate, endDate, statusFilter]) // Add statusFilter dependency

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [startDate, endDate, statusFilter])

  async function loadAllData() {
    setLoading(true)
    try {
      await Promise.all([
        loadReportData(),
        loadDashboardData(),
        loadItems()
      ])
    } finally {
      setLoading(false)
    }
  }

  async function loadReportData() {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate.toISOString().split('T')[0])
      if (endDate) params.append("endDate", endDate.toISOString().split('T')[0])
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter) // Add status filter
      // Add timestamp to bypass cache
      params.append("_t", Date.now().toString())

      const data = await apiGet<SalesReport>(`/api/reports?${params}`)
      
      // DEBUG: Log first 3 transactions to see if status field exists
      console.log('[Reports] Total transactions:', data.transactions?.length)
      console.log('[Reports] First 3 transactions:', data.transactions?.slice(0, 3).map(t => ({
        id: t.id,
        itemName: t.itemName,
        status: t.status,
        timestamp: t.timestamp
      })))
      
      setReport(data)
    } catch (error) {
      console.error("[Reports] Error fetching report:", error)
    }
  }

  async function loadDashboardData() {
    try {
      const params = new URLSearchParams()
      // Apply same date filters as report data
      if (startDate) params.append("startDate", startDate.toISOString().split('T')[0])
      if (endDate) params.append("endDate", endDate.toISOString().split('T')[0])
      // Add timestamp to bypass cache
      params.append("_t", Date.now().toString())
      
      const data = await apiGet<any>(`/api/dashboard?${params}`)
      setDashboardData(data)
    } catch (error) {
      console.error("[Reports] Error fetching dashboard data:", error)
    }
  }

  async function loadItems() {
    try {
      const data = await apiGet<any[]>("/api/items")
      setItems(data)
    } catch (error) {
      console.error("[Reports] Error fetching items:", error)
    }
  }

  // Cancel Transaction Handler
  function openCancelDialog(transaction: any) {
    setSelectedTransaction(transaction)
    setCancelReason("")
    setCancelNotes("")
    setCustomerName(transaction.customerName || "")
    setCustomerPhone("")
    setCustomerEmail("")
    setCustomerAddress("")
    setShowCancelDialog(true)
  }

  async function handleCancelTransaction() {
    if (!selectedTransaction || !cancelReason) {
      toast.error("Please select a cancellation reason")
      return
    }

    if (!customerName || !customerPhone) {
      toast.error("Please provide customer name and phone number")
      return
    }

    setCancelling(true)
    try {
      // Add auth headers
      const headers = new Headers({
        'Content-Type': 'application/json'
      })
      
      // Add authentication headers from localStorage
      const username = localStorage.getItem('username')
      const role = localStorage.getItem('userRole')
      const displayName = localStorage.getItem('displayName')
      
      if (username) headers.set('x-user-username', username)
      if (role) headers.set('x-user-role', role)
      if (displayName) headers.set('x-user-display-name', displayName)

      console.log('[Reports] Cancelling transaction:', {
        logId: selectedTransaction.id,
        reason: cancelReason,
        hasAuth: !!username
      })

      const response = await fetch('/api/logs/cancel', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          reason: cancelReason,
          notes: cancelNotes,
          staffName: currentUser?.displayName || 'Admin',
          customerName,
          customerPhone,
          customerEmail,
          customerAddress
        })
      })

      console.log('[Reports] Response status:', response.status)
      console.log('[Reports] Response headers:', Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get response text for debugging
        const text = await response.text()
        console.error('[Reports] Non-JSON response:', text.substring(0, 500))
        throw new Error(`Server returned non-JSON response (${response.status}). Check console for details.`)
      }

      const data = await response.json()
      console.log('[Reports] Response data:', data)

      if (response.ok) {
        toast.success(`Transaction cancelled successfully. Restored ${data.restoredQuantity} items to inventory.`)
        setShowCancelDialog(false)
        setSelectedTransaction(null)
        setCancelReason("")
        setCancelNotes("")
        
        // Refresh data without full page reload
        // Add cache-busting timestamp to force fresh data
        await loadAllData()
      } else {
        toast.error(data.error || 'Failed to cancel transaction')
      }
    } catch (error) {
      console.error('[Reports] Error cancelling transaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while cancelling the transaction'
      toast.error(errorMessage)
    } finally {
      setCancelling(false)
    }
  }

  // Export Functions
  async function handleExportExecutive(format: 'excel' | 'pdf') {
    if (!report || !dashboardData) {
      toast.error("No data available to export")
      return
    }

    const filters = []
    if (startDate) filters.push({ label: 'Start Date', value: startDate.toLocaleDateString() })
    if (endDate) filters.push({ label: 'End Date', value: endDate.toLocaleDateString() })

    const summary = [
      { label: 'Total Revenue', value: formatCurrencyForExport(dashboardData.totalRevenue || 0) },
      { label: 'Total Profit', value: formatCurrencyForExport(dashboardData.totalProfit || 0) },
      { label: 'Total Transactions', value: formatNumberForExport(report.transactions?.length || 0) },
      { label: 'Profit Margin', value: formatPercentageForExport(dashboardData.totalRevenue > 0 ? (dashboardData.totalProfit / dashboardData.totalRevenue) * 100 : 0) },
      { label: 'Total Items Sold', value: formatNumberForExport(report.transactions?.reduce((sum, t) => sum + t.quantity, 0) || 0) },
    ]

    const columns = [
      { header: 'Date & Time', key: 'timestamp', width: 20, format: formatDateForExport },
      { header: 'Item Name', key: 'itemName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 12, format: formatNumberForExport },
      { header: 'Revenue', key: 'totalRevenue', width: 15, format: formatCurrencyForExport },
      { header: 'Cost', key: 'totalCost', width: 15, format: formatCurrencyForExport },
      { header: 'Profit', key: 'profit', width: 15, format: formatCurrencyForExport },
    ]

    const options = {
      filename: 'Executive-Sales-Report',
      title: 'Executive Sales Report',
      subtitle: `Period: ${startDate ? startDate.toLocaleDateString() : 'All Time'} to ${endDate ? endDate.toLocaleDateString() : 'Present'}`,
      columns,
      data: report.transactions || [],
      summary,
      includeFilters: filters,
      orientation: 'landscape' as const,
    }

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.success(`${format.toUpperCase()} report downloaded successfully!`, { id: toastId })
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`, { id: toastId })
      console.error(error)
    }
  }

  async function handleExportInventory(format: 'excel' | 'pdf') {
    if (!items || items.length === 0) {
      toast.error("No inventory data available")
      return
    }

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0)
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)
    const potentialProfit = totalValue - totalCost

    const summary = [
      { label: 'Total Items', value: formatNumberForExport(items.length) },
      { label: 'Total Stock Units', value: formatNumberForExport(items.reduce((sum, item) => sum + item.quantity, 0)) },
      { label: 'Inventory Value (Selling Price)', value: formatCurrencyForExport(totalValue) },
      { label: 'Inventory Cost', value: formatCurrencyForExport(totalCost) },
      { label: 'Potential Profit', value: formatCurrencyForExport(potentialProfit) },
      { label: 'Low Stock Items', value: formatNumberForExport(items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length) },
      { label: 'Out of Stock Items', value: formatNumberForExport(items.filter(item => item.quantity === 0).length) },
    ]

    const columns = [
      { header: 'Item Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Stock Qty', key: 'quantity', width: 12, format: formatNumberForExport },
      { header: 'Reorder Level', key: 'reorderLevel', width: 12, format: formatNumberForExport },
      { header: 'Cost Price', key: 'costPrice', width: 15, format: formatCurrencyForExport },
      { header: 'Selling Price', key: 'sellingPrice', width: 15, format: formatCurrencyForExport },
      { 
        header: 'Stock Value', 
        key: 'stockValue', 
        width: 15, 
        format: formatCurrencyForExport
      },
      { 
        header: 'Status', 
        key: 'status', 
        width: 12
      },
    ]

    const itemsWithValue = items.map(item => ({
      ...item,
      stockValue: item.quantity * item.sellingPrice,
      status: item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'
    }))

    const options = {
      filename: 'Inventory-Valuation-Report',
      title: 'Inventory Valuation Report',
      subtitle: `Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`,
      columns,
      data: itemsWithValue,
      summary,
      orientation: 'landscape' as const,
    }

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.success(`${format.toUpperCase()} report downloaded successfully!`, { id: toastId })
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`, { id: toastId })
      console.error(error)
    }
  }

  async function handleExportProductPerformance(format: 'excel' | 'pdf') {
    if (!report || !report.transactions) {
      toast.error("No sales data available")
      return
    }

    // Aggregate by product
    const productMap = new Map()
    report.transactions.forEach(t => {
      if (!productMap.has(t.itemName)) {
        productMap.set(t.itemName, {
          itemName: t.itemName,
          totalQuantity: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          transactionCount: 0
        })
      }
      const product = productMap.get(t.itemName)
      product.totalQuantity += t.quantity
      product.totalRevenue += t.totalRevenue
      product.totalCost += t.totalCost
      product.totalProfit += t.profit
      product.transactionCount += 1
    })

    const productData = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    const summary = [
      { label: 'Total Products Sold', value: formatNumberForExport(productData.length) },
      { label: 'Total Revenue', value: formatCurrencyForExport(productData.reduce((sum, p) => sum + p.totalRevenue, 0)) },
      { label: 'Total Profit', value: formatCurrencyForExport(productData.reduce((sum, p) => sum + p.totalProfit, 0)) },
      { label: 'Total Units Sold', value: formatNumberForExport(productData.reduce((sum, p) => sum + p.totalQuantity, 0)) },
    ]

    const columns = [
      { header: 'Product Name', key: 'itemName', width: 35 },
      { header: 'Units Sold', key: 'totalQuantity', width: 12, format: formatNumberForExport },
      { header: 'Transactions', key: 'transactionCount', width: 12, format: formatNumberForExport },
      { header: 'Total Revenue', key: 'totalRevenue', width: 15, format: formatCurrencyForExport },
      { header: 'Total Cost', key: 'totalCost', width: 15, format: formatCurrencyForExport },
      { header: 'Total Profit', key: 'totalProfit', width: 15, format: formatCurrencyForExport },
      { 
        header: 'Profit Margin %', 
        key: 'profitMargin', 
        width: 12,
        format: formatPercentageForExport
      },
    ]

    const productDataWithMargin = productData.map(p => ({
      ...p,
      profitMargin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0
    }))

    const options = {
      filename: 'Product-Performance-Report',
      title: 'Product Performance Report',
      subtitle: `Period: ${startDate ? startDate.toLocaleDateString() : 'All Time'} to ${endDate ? endDate.toLocaleDateString() : 'Present'}`,
      columns,
      data: productDataWithMargin,
      summary,
      orientation: 'landscape' as const,
    }

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.success(`${format.toUpperCase()} report downloaded successfully!`, { id: toastId })
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`, { id: toastId })
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-2 pb-12">
      {/* Page Header - Enterprise Premium */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2 tracking-tight">
              Executive Reports
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Professional business intelligence and analytics reporting
            </p>
          </div>
        </div>
      </div>

      {/* Premium Filter & Report Type Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Date Range Filter - Modern Calendar Picker */}
        <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
              Report Period
            </CardTitle>
            <CardDescription className="text-xs">Select date range for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range Picker */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={(start, end) => {
                setStartDate(start)
                setEndDate(end)
                setActivePreset(null) // Clear preset when manually selecting dates
              }}
              className="w-full h-11"
            />
            
            {/* Quick Presets - Enhanced */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Quick select:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    const lastWeek = new Date(today)
                    lastWeek.setDate(today.getDate() - 7)
                    lastWeek.setHours(0, 0, 0, 0)
                    setStartDate(lastWeek)
                    setEndDate(today)
                    setActivePreset('last7')
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activePreset === 'last7'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    const lastMonth = new Date(today)
                    lastMonth.setDate(today.getDate() - 30)
                    lastMonth.setHours(0, 0, 0, 0)
                    setStartDate(lastMonth)
                    setEndDate(today)
                    setActivePreset('last30')
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activePreset === 'last30'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                  }`}
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                    startOfMonth.setHours(0, 0, 0, 0)
                    setStartDate(startOfMonth)
                    setEndDate(today)
                    setActivePreset('thisMonth')
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activePreset === 'thisMonth'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                  }`}
                >
                  This month
                </button>
                <button
                  onClick={() => {
                    setStartDate(null)
                    setEndDate(null)
                    setActivePreset(null)
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activePreset === null && !startDate && !endDate
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md scale-105'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Filter - NEW */}
        <Card className="lg:col-span-8 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
              Transaction Status
            </CardTitle>
            <CardDescription className="text-xs">Filter transactions by their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>All Transactions</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                    <span>Cancelled</span>
                  </div>
                </SelectItem>
                <SelectItem value="returned">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                    <span>Returned</span>
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Info */}
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {statusFilter === "all" && "Showing all transactions. Revenue excludes cancelled orders."}
                {statusFilter === "completed" && "Showing only completed transactions."}
                {statusFilter === "cancelled" && "Showing only cancelled transactions for analysis."}
                {statusFilter === "returned" && "Showing only returned transactions."}
                {statusFilter === "pending" && "Showing only pending transactions."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Type Selection - Enterprise Layout */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Select Report Type</CardTitle>
              <CardDescription className="text-xs">Choose the report you want to generate and export</CardDescription>
            </div>
            {/* Export Buttons - Top Right Corner */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  if (reportType === 'executive') handleExportExecutive('excel')
                  else if (reportType === 'inventory') handleExportInventory('excel')
                  else handleExportProductPerformance('excel')
                }}
                disabled={loading || !report}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">Excel</span>
              </Button>
              <Button
                onClick={() => {
                  if (reportType === 'executive') handleExportExecutive('pdf')
                  else if (reportType === 'inventory') handleExportInventory('pdf')
                  else handleExportProductPerformance('pdf')
                }}
                disabled={loading || !report}
                variant="outline"
                className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span className="text-sm font-semibold">PDF</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid Layout: 3 equal cards with embedded previews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Executive Sales Card with Preview */}
            <button
              onClick={() => setReportType('executive')}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left flex flex-col ${
                reportType === 'executive'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
              }`}
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 transition-colors ${
                reportType === 'executive' 
                  ? 'bg-blue-100 dark:bg-blue-900/50' 
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
              }`}>
                <BarChart3 className={`h-5 w-5 transition-colors ${
                  reportType === 'executive' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`} />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Executive Sales
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Sales performance & profit analysis
              </p>
              
              {/* Embedded Preview - 4 Mini Metric Cards */}
              {dashboardData && (
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-0.5">Revenue</p>
                    <p className="text-xs font-bold text-blue-900 dark:text-white tabular-nums">
                      {formatCurrency(dashboardData?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-green-200/50 dark:border-green-800/50">
                    <p className="text-[9px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-0.5">Profit</p>
                    <p className="text-xs font-bold text-green-900 dark:text-white tabular-nums">
                      {formatCurrency(dashboardData?.totalProfit || 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-purple-200/50 dark:border-purple-800/50">
                    <p className="text-[9px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-0.5">Transactions</p>
                    <p className="text-xs font-bold text-purple-900 dark:text-white tabular-nums">
                      {formatNumber(report?.transactions?.length || 0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-orange-200/50 dark:border-orange-800/50">
                    <p className="text-[9px] font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-0.5">Margin</p>
                    <p className="text-xs font-bold text-orange-900 dark:text-white tabular-nums">
                      {dashboardData?.totalRevenue > 0 
                        ? ((dashboardData.totalProfit / dashboardData.totalRevenue) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                  </div>
                </div>
              )}
              
              {reportType === 'executive' && (
                <div className="absolute top-3 right-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
              )}
            </button>

            {/* Inventory Card with Preview */}
            <button
              onClick={() => setReportType('inventory')}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left flex flex-col ${
                reportType === 'inventory'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg shadow-purple-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'
              }`}
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 transition-colors ${
                reportType === 'inventory' 
                  ? 'bg-purple-100 dark:bg-purple-900/50' 
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30'
              }`}>
                <Package className={`h-5 w-5 transition-colors ${
                  reportType === 'inventory' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                }`} />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Inventory
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Stock value & status overview
              </p>
              
              {/* Embedded Preview - 4 Mini Metric Cards */}
              {items && items.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-blue-200/50 dark:border-blue-800/50">
                    <p className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-0.5">Items</p>
                    <p className="text-xs font-bold text-blue-900 dark:text-white tabular-nums">
                      {formatNumber(items.length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-green-200/50 dark:border-green-800/50">
                    <p className="text-[9px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-0.5">Value</p>
                    <p className="text-xs font-bold text-green-900 dark:text-white tabular-nums">
                      {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0))}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-0.5">Low Stock</p>
                    <p className="text-xs font-bold text-amber-900 dark:text-white tabular-nums">
                      {formatNumber(items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-red-200/50 dark:border-red-800/50">
                    <p className="text-[9px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-0.5">Out</p>
                    <p className="text-xs font-bold text-red-900 dark:text-white tabular-nums">
                      {formatNumber(items.filter(item => item.quantity === 0).length)}
                    </p>
                  </div>
                </div>
              )}
              
              {reportType === 'inventory' && (
                <div className="absolute top-3 right-3">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                </div>
              )}
            </button>

            {/* Product Performance Card with Preview */}
            <button
              onClick={() => setReportType('product')}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left flex flex-col ${
                reportType === 'product'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-lg shadow-orange-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md'
              }`}
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 transition-colors ${
                reportType === 'product' 
                  ? 'bg-orange-100 dark:bg-orange-900/50' 
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30'
              }`}>
                <TrendingUp className={`h-5 w-5 transition-colors ${
                  reportType === 'product' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'
                }`} />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                Product Performance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Top performers & margins
              </p>
              
              {/* Embedded Preview - Product Stats */}
              {report && report.transactions && report.transactions.length > 0 && (() => {
                const productMap = new Map()
                report.transactions.forEach(t => {
                  if (!productMap.has(t.itemName)) {
                    productMap.set(t.itemName, {
                      totalRevenue: 0,
                      totalProfit: 0,
                      totalQuantity: 0
                    })
                  }
                  const product = productMap.get(t.itemName)
                  product.totalRevenue += (t.totalRevenue || 0)
                  product.totalProfit += (t.profit || 0)
                  product.totalQuantity += (t.quantity || 0)
                })
                const productData = Array.from(productMap.values())
                const totalRevenue = productData.reduce((sum, p) => sum + p.totalRevenue, 0)
                const totalProfit = productData.reduce((sum, p) => sum + p.totalProfit, 0)
                
                // Debug logging
                console.log('[Product Performance Card] Sample transaction:', report.transactions[0])
                console.log('[Product Performance Card] Total Revenue:', totalRevenue)
                console.log('[Product Performance Card] Total Profit:', totalProfit)
                console.log('[Product Performance Card] Product Data:', productData.slice(0, 3))
                
                return (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-blue-200/50 dark:border-blue-800/50">
                      <p className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-0.5">Products</p>
                      <p className="text-xs font-bold text-blue-900 dark:text-white tabular-nums">
                        {formatNumber(productData.length)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-green-200/50 dark:border-green-800/50">
                      <p className="text-[9px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-0.5">Revenue</p>
                      <p className="text-xs font-bold text-green-900 dark:text-white tabular-nums">
                        {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-orange-200/50 dark:border-orange-800/50">
                      <p className="text-[9px] font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-0.5">Profit</p>
                      <p className="text-xs font-bold text-orange-900 dark:text-white tabular-nums">
                        {formatCurrency(totalProfit)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-purple-200/50 dark:border-purple-800/50">
                      <p className="text-[9px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-0.5">Margin</p>
                      <p className="text-xs font-bold text-purple-900 dark:text-white tabular-nums">
                        {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                      </p>
                    </div>
                  </div>
                )
              })()}
              
              {reportType === 'product' && (
                <div className="absolute top-3 right-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                </div>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History - All Reports */}
      {!loading && report && report.transactions && report.transactions.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Transaction History
              </CardTitle>
              <span className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full">
                {report.transactions.length} transactions
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Scroll Hint */}
            <div className="md:hidden mb-2 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <span>←</span>
                <span>Swipe to see all columns • Tap row to highlight</span>
                <span>→</span>
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[130px]">Date & Time</th>
                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">Item</th>
                    <th className="py-2.5 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[90px]">Status</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[60px]">Qty</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[100px]">Revenue</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[100px]">Cost</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[100px]">Profit</th>
                    <th className="py-2.5 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.transactions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((transaction: any) => (
                    <tr 
                      key={transaction.id} 
                      onClick={() => setSelectedRowId(selectedRowId === transaction.id ? null : transaction.id)}
                      className={cn(
                        "transition-all duration-200 cursor-pointer",
                        selectedRowId === transaction.id
                          ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400 ring-inset"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      )}
                    >
                      <td className="py-2.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: '2-digit',
                          timeZone: 'Asia/Manila'
                        })}
                        {' '}
                        {new Date(transaction.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: false,
                          timeZone: 'Asia/Manila'
                        })}
                      </td>
                      <td className={cn(
                        "py-2.5 px-4 text-xs font-medium max-w-[200px] truncate",
                        selectedRowId === transaction.id
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-slate-800 dark:text-slate-200"
                      )}>
                        {transaction.itemName}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(transaction.status || 'completed')}
                      </td>
                      <td className={cn(
                        "py-2.5 px-4 text-right text-xs font-semibold tabular-nums whitespace-nowrap",
                        selectedRowId === transaction.id
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-slate-800 dark:text-slate-200"
                      )}>
                        {formatNumber(transaction.quantity)}
                      </td>
                      <td className={cn(
                        "py-2.5 px-4 text-right text-xs font-semibold tabular-nums whitespace-nowrap",
                        selectedRowId === transaction.id
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-slate-800 dark:text-slate-200"
                      )}>
                        {formatCurrency(transaction.totalRevenue)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(transaction.totalCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-xs font-bold text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap">
                        {formatCurrency(transaction.profit)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {(!transaction.status || transaction.status === 'completed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openCancelDialog(transaction)
                            }}
                            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {transaction.status === 'cancelled' && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {report.transactions.length > itemsPerPage && (
              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-semibold text-slate-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, report.transactions.length)}
                  </span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{report.transactions.length}</span> transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(report.transactions.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        const totalPages = Math.ceil(report.transactions.length / itemsPerPage)
                        return page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1)
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-slate-400">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "h-8 w-8 p-0 text-xs",
                              currentPage === page && "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(report.transactions.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(report.transactions.length / itemsPerPage)}
                    className="h-8 px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State - Premium */}
      {loading && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-4 font-medium">Loading report data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Transaction Dialog - Enterprise Grade */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold">Cancel Transaction</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Complete the form below to process the cancellation. All fields marked with * are required.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Transaction Summary Card */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-base text-slate-900 dark:text-white">
                      {selectedTransaction.itemName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Transaction ID: {selectedTransaction.id}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedTransaction.department || 'N/A'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quantity</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedTransaction.quantity} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(selectedTransaction.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {new Date(selectedTransaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Customer Information
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customer-name" className="text-sm font-medium flex items-center gap-1">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="h-10"
                      required
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone" className="text-sm font-medium flex items-center gap-1">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09123456789"
                      className="h-10"
                      required
                    />
                  </div>

                  {/* Customer Email */}
                  <div className="space-y-2">
                    <Label htmlFor="customer-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="h-10"
                    />
                  </div>

                  {/* Customer Address */}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customer-address" className="text-sm font-medium">
                      Complete Address
                    </Label>
                    <Textarea
                      id="customer-address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Street, Barangay, City, Province"
                      className="min-h-[70px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cancellation Details Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 pb-2">
                  <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-900/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Cancellation Details
                  </h4>
                </div>

                {/* Cancellation Reason */}
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason" className="text-sm font-medium flex items-center gap-1">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger id="cancel-reason" className="h-10">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_request">Customer Request</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="payment_failed">Payment Failed</SelectItem>
                      <SelectItem value="duplicate_order">Duplicate Order</SelectItem>
                      <SelectItem value="pricing_error">Pricing Error</SelectItem>
                      <SelectItem value="quality_issue">Quality Issue</SelectItem>
                      <SelectItem value="delivery_issue">Delivery Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="cancel-notes" className="text-sm font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="cancel-notes"
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    placeholder="Provide additional context or details about this cancellation..."
                    className="min-h-[90px] resize-none"
                  />
                </div>
              </div>

              {/* Impact Alert */}
              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Inventory Impact:</span> This will restore{' '}
                  <span className="font-bold">{selectedTransaction.quantity} units</span> of{' '}
                  <span className="font-semibold">{selectedTransaction.itemName}</span> back to inventory.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
              className="min-w-[120px]"
            >
              Keep Transaction
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTransaction}
              disabled={!cancelReason || !customerName || !customerPhone || cancelling}
              className="min-w-[120px]"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
