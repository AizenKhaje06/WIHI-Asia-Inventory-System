"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Calendar,
  Percent
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { apiGet } from "@/lib/api-client"
import { toast } from "sonner"
import { 
  exportToExcel, 
  exportToPDF,
  formatCurrencyForExport,
  formatDateForExport,
  formatNumberForExport,
  formatPercentageForExport
} from "@/lib/export-utils"
import { FileSpreadsheet, FileDown } from "lucide-react"

interface DepartmentDetail {
  name: string
  metrics: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    transactionCount: number
    totalQuantity: number
    profitMargin: number
  }
  cashFlow: Array<{
    date: string
    revenue: number
    cost: number
    profit: number
  }>
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    itemName: string
    quantity: number
    revenue: number
    cost: number
    profit: number
    timestamp: string
    staffName?: string
    notes?: string
  }>
}

export default function SalesChannelDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const departmentName = decodeURIComponent(params.id as string)
  const [data, setData] = useState<DepartmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || "")
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || "")
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    if (!startDate || !endDate) {
      // Set default date range (last 30 days)
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(end.toISOString().split('T')[0])
    }
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchData()
    }
  }, [startDate, endDate, departmentName])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const result = await apiGet<{ department: DepartmentDetail }>(`/api/departments/${encodeURIComponent(departmentName)}?${params}`)
      setData(result.department)
    } catch (error) {
      console.error("Error fetching department details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading channel details...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Channel not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isPositive = data.metrics.totalProfit >= 0

  // Aggregate cash flow data based on selected period
  const getAggregatedCashFlow = () => {
    if (!data?.cashFlow) return []
    
    if (chartPeriod === 'day') {
      return data.cashFlow
    }
    
    const aggregated: { [key: string]: { revenue: number; cost: number; profit: number; count: number } } = {}
    
    data.cashFlow.forEach(item => {
      const date = new Date(item.date)
      let key: string
      
      if (chartPeriod === 'week') {
        // Get week start (Sunday)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        // Month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
      }
      
      if (!aggregated[key]) {
        aggregated[key] = { revenue: 0, cost: 0, profit: 0, count: 0 }
      }
      
      aggregated[key].revenue += item.revenue
      aggregated[key].cost += item.cost
      aggregated[key].profit += item.profit
      aggregated[key].count++
    })
    
    return Object.entries(aggregated)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const chartData = getAggregatedCashFlow()

  const formatXAxisDate = (date: string) => {
    const d = new Date(date)
    if (chartPeriod === 'day') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (chartPeriod === 'week') {
      return `Week ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }

  // Export Function for Sales Channel Report
  async function handleExportChannel(format: 'excel' | 'pdf') {
    if (!data) {
      toast.error("No data available to export")
      return
    }

    const filters = []
    if (startDate) filters.push({ label: 'Start Date', value: new Date(startDate).toLocaleDateString() })
    if (endDate) filters.push({ label: 'End Date', value: new Date(endDate).toLocaleDateString() })

    const summary = [
      { label: 'Sales Channel', value: data.name },
      { label: 'Total Revenue', value: formatCurrencyForExport(data.metrics.totalRevenue) },
      { label: 'Total Cost', value: formatCurrencyForExport(data.metrics.totalCost) },
      { label: 'Total Profit', value: formatCurrencyForExport(data.metrics.totalProfit) },
      { label: 'Profit Margin', value: formatPercentageForExport(data.metrics.profitMargin) },
      { label: 'Total Transactions', value: formatNumberForExport(data.metrics.transactionCount) },
      { label: 'Total Items Sold', value: formatNumberForExport(data.metrics.totalQuantity) },
    ]

    // Separate transactions by status
    const salesTransactions = data.recentTransactions.filter((t: any) => !t.status || t.status === 'completed')
    const cancelledTransactions = data.recentTransactions.filter((t: any) => t.status === 'cancelled')
    const returnedTransactions = data.recentTransactions.filter((t: any) => t.status === 'returned')

    const columns = [
      { header: 'Date & Time', key: 'timestamp', width: 20, format: formatDateForExport },
      { header: 'Item Name', key: 'itemName', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 12, format: formatNumberForExport },
      { header: 'Revenue', key: 'revenue', width: 15, format: formatCurrencyForExport },
      { header: 'Cost', key: 'cost', width: 15, format: formatCurrencyForExport },
      { header: 'Profit', key: 'profit', width: 15, format: formatCurrencyForExport },
      { header: 'Staff', key: 'staffName', width: 20 },
    ]

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        // For Excel, create multiple sheets
        const XLSX = await import('xlsx')
        const wb = XLSX.utils.book_new()

        // Summary Sheet
        const summaryData: any[][] = []
        summaryData.push([`${data.name} - Sales Channel Report`])
        summaryData.push([])
        summaryData.push(['Generated:', new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })])
        summaryData.push([])
        
        if (filters.length > 0) {
          summaryData.push(['Applied Filters:'])
          filters.forEach(filter => summaryData.push([filter.label, filter.value]))
          summaryData.push([])
        }

        summaryData.push(['Summary:'])
        summary.forEach(item => summaryData.push([item.label, item.value]))
        summaryData.push([])
        summaryData.push(['Transaction Breakdown:'])
        summaryData.push(['Sales Transactions', salesTransactions.length])
        summaryData.push(['Cancelled Transactions', cancelledTransactions.length])
        summaryData.push(['Returned Transactions', returnedTransactions.length])
        summaryData.push(['Total Transactions', data.recentTransactions.length])

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

        // Sales Transactions Sheet
        if (salesTransactions.length > 0) {
          const salesData: any[][] = []
          salesData.push(['Sales Transactions'])
          salesData.push([])
          salesData.push(columns.map(col => col.header))
          salesTransactions.forEach((row: any) => {
            salesData.push(columns.map(col => {
              const value = row[col.key]
              return col.format ? col.format(value, row) : value
            }))
          })
          salesData.push([])
          salesData.push(['Total Sales:', salesTransactions.length])

          const salesWs = XLSX.utils.aoa_to_sheet(salesData)
          salesWs['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
          XLSX.utils.book_append_sheet(wb, salesWs, 'Sales')
        }

        // Cancelled Transactions Sheet
        if (cancelledTransactions.length > 0) {
          const cancelledData: any[][] = []
          cancelledData.push(['Cancelled Transactions'])
          cancelledData.push([])
          cancelledData.push(columns.map(col => col.header))
          cancelledTransactions.forEach((row: any) => {
            cancelledData.push(columns.map(col => {
              const value = row[col.key]
              return col.format ? col.format(value, row) : value
            }))
          })
          cancelledData.push([])
          cancelledData.push(['Total Cancelled:', cancelledTransactions.length])

          const cancelledWs = XLSX.utils.aoa_to_sheet(cancelledData)
          cancelledWs['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
          XLSX.utils.book_append_sheet(wb, cancelledWs, 'Cancelled')
        }

        // Returned Transactions Sheet
        if (returnedTransactions.length > 0) {
          const returnedData: any[][] = []
          returnedData.push(['Returned Transactions'])
          returnedData.push([])
          returnedData.push(columns.map(col => col.header))
          returnedTransactions.forEach((row: any) => {
            returnedData.push(columns.map(col => {
              const value = row[col.key]
              return col.format ? col.format(value, row) : value
            }))
          })
          returnedData.push([])
          returnedData.push(['Total Returned:', returnedTransactions.length])

          const returnedWs = XLSX.utils.aoa_to_sheet(returnedData)
          returnedWs['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
          XLSX.utils.book_append_sheet(wb, returnedWs, 'Returned')
        }

        // Top Products Sheet
        if (data.topProducts && data.topProducts.length > 0) {
          const topProductsData: any[][] = []
          topProductsData.push(['Top Products'])
          topProductsData.push([])
          topProductsData.push(['Product Name', 'Quantity Sold', 'Revenue'])
          data.topProducts.forEach((product: any) => {
            topProductsData.push([
              product.name,
              formatNumberForExport(product.quantity),
              formatCurrencyForExport(product.revenue)
            ])
          })

          const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData)
          topProductsWs['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }]
          XLSX.utils.book_append_sheet(wb, topProductsWs, 'Top Products')
        }

        // Save Excel file
        const filename = `Sales-Channel-Report-${data.name}-${new Date().toISOString().split('T')[0]}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}.xlsx`
        XLSX.writeFile(wb, filename)
        
        toast.success('Excel report downloaded successfully!', { id: toastId })
      } else {
        // For PDF, create sections for each transaction type
        const jsPDF = (await import('jspdf')).default
        const autoTable = (await import('jspdf-autotable')).default

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        }) as any

        let yPosition = 20

        // Title
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(`${data.name} - Sales Channel Report`, 14, yPosition)
        yPosition += 10

        // Timestamp
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, 14, yPosition)
        yPosition += 8

        // Filters
        if (filters.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Applied Filters:', 14, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')
          filters.forEach((filter: any) => {
            doc.text(`${filter.label}: ${filter.value}`, 14, yPosition)
            yPosition += 5
          })
          yPosition += 3
        }

        // Summary (remove ₱ symbols for PDF)
        const pdfSummary = summary.map(item => ({
          ...item,
          value: typeof item.value === 'string' ? item.value.replace(/₱/g, '') : item.value
        }))

        doc.setFont('helvetica', 'bold')
        doc.text('Summary:', 14, yPosition)
        yPosition += 5
        doc.setFont('helvetica', 'normal')
        pdfSummary.forEach((item: any) => {
          doc.text(`${item.label}: ${item.value}`, 14, yPosition)
          yPosition += 5
        })
        yPosition += 5

        // Transaction breakdown
        doc.setFont('helvetica', 'bold')
        doc.text('Transaction Breakdown:', 14, yPosition)
        yPosition += 5
        doc.setFont('helvetica', 'normal')
        doc.text(`Sales: ${salesTransactions.length}`, 14, yPosition)
        yPosition += 5
        doc.text(`Cancelled: ${cancelledTransactions.length}`, 14, yPosition)
        yPosition += 5
        doc.text(`Returned: ${returnedTransactions.length}`, 14, yPosition)
        yPosition += 10

        // Sales Transactions Table
        if (salesTransactions.length > 0) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Sales Transactions', 14, yPosition)
          yPosition += 5

          const salesTableData = salesTransactions.map((row: any) => 
            columns.map(col => {
              const value = row[col.key]
              const formatted = col.format ? col.format(value, row) : String(value ?? '')
              return typeof formatted === 'string' ? formatted.replace(/₱/g, '') : formatted
            })
          )

          autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: salesTableData,
            startY: yPosition,
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
          })

          yPosition = (doc as any).lastAutoTable.finalY + 10
        }

        // Cancelled Transactions Table
        if (cancelledTransactions.length > 0) {
          if (yPosition > 180) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Cancelled Transactions', 14, yPosition)
          yPosition += 5

          const cancelledTableData = cancelledTransactions.map((row: any) => 
            columns.map(col => {
              const value = row[col.key]
              const formatted = col.format ? col.format(value, row) : String(value ?? '')
              return typeof formatted === 'string' ? formatted.replace(/₱/g, '') : formatted
            })
          )

          autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: cancelledTableData,
            startY: yPosition,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
          })

          yPosition = (doc as any).lastAutoTable.finalY + 10
        }

        // Returned Transactions Table
        if (returnedTransactions.length > 0) {
          if (yPosition > 180) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Returned Transactions', 14, yPosition)
          yPosition += 5

          const returnedTableData = returnedTransactions.map((row: any) => 
            columns.map(col => {
              const value = row[col.key]
              const formatted = col.format ? col.format(value, row) : String(value ?? '')
              return typeof formatted === 'string' ? formatted.replace(/₱/g, '') : formatted
            })
          )

          autoTable(doc, {
            head: [columns.map(col => col.header)],
            body: returnedTableData,
            startY: yPosition,
            theme: 'striped',
            headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
          })
        }

        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          const pageSize = doc.internal.pageSize
          const pageHeight = pageSize.height || pageSize.getHeight()
          
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 10)
          doc.text(`Total Records: ${data.recentTransactions.length}`, pageSize.width - 50, pageHeight - 10)
        }

        // Save PDF
        const filename = `Sales-Channel-Report-${data.name}-${new Date().toISOString().split('T')[0]}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}.pdf`
        doc.save(filename)
        
        toast.success('PDF report downloaded successfully!', { id: toastId })
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`, { id: toastId })
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-2">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales Channels
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {data.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Detailed performance analytics and cash flow
            </p>
          </div>
          
          {/* Export Buttons - Top Right Corner */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleExportChannel('excel')}
              className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold">Excel</span>
            </Button>
            <Button
              onClick={() => handleExportChannel('pdf')}
              variant="outline"
              className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 w-full"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 w-full"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchData} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(data.metrics.totalRevenue)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-red-100 dark:bg-red-900/30">
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatCurrency(data.metrics.totalCost)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Cost</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-[5px] ${isPositive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <DollarSign className={`h-4 w-4 ${isPositive ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${isPositive ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(data.metrics.totalProfit)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Profit</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-amber-100 dark:bg-amber-900/30">
                <Percent className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {data.metrics.profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Margin</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(data.metrics.transactionCount)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Transactions</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-[5px] bg-indigo-100 dark:bg-indigo-900/30">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatNumber(data.metrics.totalQuantity)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Items Sold</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              Cash Flow Over Time
            </CardTitle>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                variant={chartPeriod === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartPeriod('day')}
                className={`h-7 px-2.5 text-xs ${
                  chartPeriod === 'day' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Day
              </Button>
              <Button
                variant={chartPeriod === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartPeriod('week')}
                className={`h-7 px-2.5 text-xs ${
                  chartPeriod === 'week' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Week
              </Button>
              <Button
                variant={chartPeriod === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartPeriod('month')}
                className={`h-7 px-2.5 text-xs ${
                  chartPeriod === 'month' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[300px]">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatXAxisDate}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => {
                      const d = new Date(date)
                      if (chartPeriod === 'day') {
                        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      } else if (chartPeriod === 'week') {
                        return `Week of ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      } else {
                        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      }
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    name="Revenue" 
                    fill="url(#colorRevenue)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    name="Cost" 
                    fill="url(#colorCost)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8B5CF6" 
                    strokeWidth={2} 
                    name="Profit" 
                    fill="url(#colorProfit)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Mobile Scroll Hint */}
          <div className="md:hidden text-center mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ← Swipe to view full chart →
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Top Products */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                    <XAxis 
                      type="number"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-xs md:text-sm text-slate-900 dark:text-white break-words">
                          {transaction.itemName}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                        {formatCurrency(transaction.revenue)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] md:text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Qty: {transaction.quantity}
                      </span>
                      {transaction.staffName && (
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          Staff: {transaction.staffName}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No transactions found
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
