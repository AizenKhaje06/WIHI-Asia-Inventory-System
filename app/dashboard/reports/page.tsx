"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, Package, TrendingUp, DollarSign, ShoppingCart, 
  FileSpreadsheet, FileDown, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import type { SalesReport } from "@/lib/types"
import { toast } from "sonner"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { apiGet } from "@/lib/api-client"
import { 
  exportToExcel, 
  exportToPDF,
  formatCurrencyForExport,
  formatDateForExport,
  formatNumberForExport,
  formatPercentageForExport
} from "@/lib/export-utils"

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportType, setReportType] = useState("executive")
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    loadAllData()
  }, [startDate, endDate])

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
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const data = await apiGet<SalesReport>(`/api/reports?${params}`)
      setReport(data)
    } catch (error) {
      console.error("[Reports] Error fetching report:", error)
    }
  }

  async function loadDashboardData() {
    try {
      const data = await apiGet<any>("/api/dashboard?period=1M")
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

  // Export Functions
  async function handleExportExecutive(format: 'excel' | 'pdf') {
    if (!report || !dashboardData) {
      toast.error("No data available to export")
      return
    }

    const filters = []
    if (startDate) filters.push({ label: 'Start Date', value: startDate })
    if (endDate) filters.push({ label: 'End Date', value: endDate })

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
      subtitle: `Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`,
      columns,
      data: report.transactions || [],
      summary,
      includeFilters: filters,
      orientation: 'landscape' as const,
    }

    toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.dismiss()
      toast.success(`${format.toUpperCase()} report downloaded successfully!`)
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to export ${format.toUpperCase()} report`)
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
        format: (val: any, row: any) => formatCurrencyForExport((row?.quantity || 0) * (row?.sellingPrice || 0))
      },
      { 
        header: 'Status', 
        key: 'status', 
        width: 12,
        format: (val: any, row: any) => {
          if (row.quantity === 0) return 'Out of Stock'
          if (row.quantity <= row.reorderLevel) return 'Low Stock'
          return 'In Stock'
        }
      },
    ]

    const itemsWithValue = items.map(item => ({
      ...item,
      stockValue: item.quantity * item.sellingPrice
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

    toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.dismiss()
      toast.success(`${format.toUpperCase()} report downloaded successfully!`)
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to export ${format.toUpperCase()} report`)
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
        format: (val: any, row: any) => formatPercentageForExport(row.totalRevenue > 0 ? (row.totalProfit / row.totalRevenue) * 100 : 0)
      },
    ]

    const options = {
      filename: 'Product-Performance-Report',
      title: 'Product Performance Report',
      subtitle: `Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`,
      columns,
      data: productData,
      summary,
      orientation: 'landscape' as const,
    }

    toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        await exportToExcel(options)
      } else {
        await exportToPDF(options)
      }
      toast.dismiss()
      toast.success(`${format.toUpperCase()} report downloaded successfully!`)
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to export ${format.toUpperCase()} report`)
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6 pb-12">
      {/* Page Header - Compact */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Executive Reports
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Professional business intelligence and analytics reporting
        </p>
      </div>

      {/* Compact Filter Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* Date Range - Compact */}
        <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                Start Date
              </Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                End Date
              </Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-9 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Type Selector - Compact */}
        <Card className="lg:col-span-8 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Select Report Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReportType('executive')}
                className={`p-3 rounded-lg border transition-all text-left ${
                  reportType === 'executive'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className={`h-4 w-4 ${reportType === 'executive' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Executive Sales
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  Sales performance & profit analysis
                </p>
              </button>

              <button
                onClick={() => setReportType('inventory')}
                className={`p-3 rounded-lg border transition-all text-left ${
                  reportType === 'inventory'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Package className={`h-4 w-4 ${reportType === 'inventory' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Inventory
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  Stock value & status overview
                </p>
              </button>

              <button
                onClick={() => setReportType('product')}
                className={`p-3 rounded-lg border transition-all text-left ${
                  reportType === 'product'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={`h-4 w-4 ${reportType === 'product' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Product Performance
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  Top performers & margins
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Button
          onClick={() => {
            if (reportType === 'executive') handleExportExecutive('excel')
            else if (reportType === 'inventory') handleExportInventory('excel')
            else handleExportProductPerformance('excel')
          }}
          disabled={loading}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white h-11"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="font-medium">Export to Excel</span>
        </Button>

        <Button
          onClick={() => {
            if (reportType === 'executive') handleExportExecutive('pdf')
            else if (reportType === 'inventory') handleExportInventory('pdf')
            else handleExportProductPerformance('pdf')
          }}
          disabled={loading}
          className="gap-2 bg-red-600 hover:bg-red-700 text-white h-11"
        >
          <FileDown className="h-4 w-4" />
          <span className="font-medium">Export to PDF</span>
        </Button>
      </div>

      {/* Report Preview - Executive Sales */}
      {reportType === 'executive' && report && dashboardData && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Executive Sales Report
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Key performance indicators and transaction details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Compact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-blue-900 dark:text-white">
                  {formatCurrency(dashboardData?.totalRevenue || 0)}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Total Profit</p>
                <p className="text-xl font-bold text-green-900 dark:text-white">
                  {formatCurrency(dashboardData?.totalProfit || 0)}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Transactions</p>
                <p className="text-xl font-bold text-purple-900 dark:text-white">
                  {formatNumber(report.transactions?.length || 0)}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">Profit Margin</p>
                <p className="text-xl font-bold text-orange-900 dark:text-white">
                  {dashboardData?.totalRevenue > 0 
                    ? ((dashboardData.totalProfit / dashboardData.totalRevenue) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                💡 Export to Excel or PDF to view complete transaction details and analysis
              </p>
            </div>

            {/* Transaction History Table - Compact */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Transaction History
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {report.transactions?.length || 0} transactions
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Item</th>
                      <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
                      <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                      <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.transactions?.slice(0, 50).map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                          {' '}
                          {new Date(transaction.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </td>
                        <td className="py-2.5 px-4 text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[250px] truncate">
                          {transaction.itemName}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {formatNumber(transaction.quantity)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {formatCurrency(transaction.totalRevenue)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                          {formatCurrency(transaction.totalCost)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-bold text-green-600 dark:text-green-400 tabular-nums">
                          {formatCurrency(transaction.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {report.transactions && report.transactions.length > 50 && (
                <div className="mt-3 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Showing first 50 of {report.transactions.length} transactions. Export to see all data.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview - Inventory */}
      {reportType === 'inventory' && items.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              Inventory Valuation Report
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Stock value and status overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Compact KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Total Items</p>
                <p className="text-xl font-bold text-blue-900 dark:text-white">
                  {formatNumber(items.length)}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Inventory Value</p>
                <p className="text-xl font-bold text-green-900 dark:text-white">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0))}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Low Stock</p>
                <p className="text-xl font-bold text-amber-900 dark:text-white">
                  {formatNumber(items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length)}
                </p>
              </div>

              <div className="p-3 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Out of Stock</p>
                <p className="text-xl font-bold text-red-900 dark:text-white">
                  {formatNumber(items.filter(item => item.quantity === 0).length)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                📦 Export to Excel or PDF to view complete inventory details with valuations
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview - Product Performance */}
      {reportType === 'product' && report && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Product Performance Report
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Top performing products and profit analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                🏆 Export to Excel or PDF to view complete product performance rankings and profit margins
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading report data...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
