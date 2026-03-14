"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  ChevronDown
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { apiGet } from "@/lib/api-client"
import { BrandLoader } from '@/components/ui/brand-loader'
import { toast } from "sonner"
import { 
  formatCurrencyForExport,
  formatDateForExport,
  formatNumberForExport,
  formatPercentageForExport
} from "@/lib/export-utils"

interface Department {
  name: string
  type: 'sale' | 'demo' | 'internal' | 'transfer'
  revenue: number
  cost: number
  profit: number
  transactions: number
  quantity: number
  parcelStatus?: {
    pending: number
    inTransit: number
    delivered: number
    total: number
  }
  averageOrderValue?: number
  fulfillmentRate?: number
}

interface DepartmentsData {
  departments: Department[]
  totals: {
    revenue: number
    cost: number
    profit: number
    transactions: number
    quantity: number
  }
  dateRange: {
    start: string | null
    end: string | null
  }
}

export default function SalesChannelsPage() {
  const router = useRouter()
  const [data, setData] = useState<DepartmentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchData()
    }
  }, [startDate, endDate])

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const result = await apiGet<DepartmentsData>(`/api/departments?${params}`)
      setData(result)
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (name: string) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('facebook')) return '/facebook.png'
    if (nameLower.includes('tiktok')) return '/tiktok.png'
    if (nameLower.includes('lazada')) return '/Lazada.png'
    if (nameLower.includes('shopee')) return '/Shopee.png'
    if (nameLower.includes('physical')) return '/Physical Store.png'
    return '/placeholder.svg'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'demo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'internal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'transfer': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const chartData = data?.departments.map(d => ({
    name: d.name,
    revenue: d.revenue
  })) || []

  // Export Functions
  async function handleExportAllChannels(format: 'excel' | 'pdf') {
    if (!data || !data.departments || data.departments.length === 0) {
      toast.error("No data available to export")
      return
    }

    const filters = []
    if (startDate) filters.push({ label: 'Start Date', value: new Date(startDate).toLocaleDateString() })
    if (endDate) filters.push({ label: 'End Date', value: new Date(endDate).toLocaleDateString() })

    const summary = [
      { label: 'Total Sales Channels', value: formatNumberForExport(data.departments.length) },
      { label: 'Total Revenue', value: formatCurrencyForExport(data.totals.revenue) },
      { label: 'Total Cost', value: formatCurrencyForExport(data.totals.cost) },
      { label: 'Total Profit', value: formatCurrencyForExport(data.totals.profit) },
      { label: 'Profit Margin', value: formatPercentageForExport(data.totals.revenue > 0 ? (data.totals.profit / data.totals.revenue) * 100 : 0) },
      { label: 'Total Transactions', value: formatNumberForExport(data.totals.transactions) },
      { label: 'Total Items Sold', value: formatNumberForExport(data.totals.quantity) },
    ]

    const columns = [
      { header: 'Sales Channel', key: 'name', width: 30 },
      { header: 'Revenue', key: 'revenue', width: 15, format: formatCurrencyForExport },
      { header: 'Cost', key: 'cost', width: 15, format: formatCurrencyForExport },
      { header: 'Profit', key: 'profit', width: 15, format: formatCurrencyForExport },
      { 
        header: 'Profit Margin %', 
        key: 'profitMargin', 
        width: 12,
        format: formatPercentageForExport
      },
      { header: 'Transactions', key: 'transactions', width: 12, format: formatNumberForExport },
      { header: 'Items Sold', key: 'quantity', width: 12, format: formatNumberForExport },
    ]

    const channelsWithMargin = data.departments.map(d => ({
      ...d,
      profitMargin: d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0
    }))

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
    
    try {
      if (format === 'excel') {
        const XLSX = await import('xlsx')
        const wb = XLSX.utils.book_new()

        // Summary Sheet
        const summaryData: any[][] = []
        summaryData.push(['All Sales Channels Report'])
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

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

        // Sales Channels Sheet
        const channelsData: any[][] = []
        channelsData.push(['Sales Channels Performance'])
        channelsData.push([])
        channelsData.push(columns.map(col => col.header))
        channelsWithMargin.forEach((row: any) => {
          channelsData.push(columns.map(col => {
            const value = row[col.key]
            return col.format ? col.format(value) : value
          }))
        })

        const channelsWs = XLSX.utils.aoa_to_sheet(channelsData)
        channelsWs['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
        XLSX.utils.book_append_sheet(wb, channelsWs, 'Sales Channels')

        // Save Excel file
        const filename = `All-Sales-Channels-Report-${new Date().toISOString().split('T')[0]}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}.xlsx`
        XLSX.writeFile(wb, filename)
        
        toast.success('Excel report downloaded successfully!', { id: toastId })
      } else {
        // PDF Export
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
        doc.text('All Sales Channels Report', 14, yPosition)
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
        yPosition += 10

        // Sales Channels Table
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Sales Channels Performance', 14, yPosition)
        yPosition += 5

        const tableData = channelsWithMargin.map((row: any) => 
          columns.map(col => {
            const value = row[col.key]
            const formatted = col.format ? col.format(value) : String(value ?? '')
            return typeof formatted === 'string' ? formatted.replace(/₱/g, '') : formatted
          })
        )

        autoTable(doc, {
          head: [columns.map(col => col.header)],
          body: tableData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        })

        // Footer
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          const pageSize = doc.internal.pageSize
          const pageHeight = pageSize.height || pageSize.getHeight()
          
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 10)
          doc.text(`Total Channels: ${data.departments.length}`, pageSize.width - 50, pageHeight - 10)
        }

        // Save PDF
        const filename = `All-Sales-Channels-Report-${new Date().toISOString().split('T')[0]}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}.pdf`
        doc.save(filename)
        
        toast.success('PDF report downloaded successfully!', { id: toastId })
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`, { id: toastId })
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[600px]">
        <div className="text-center">
          <BrandLoader size="lg" />
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
            Loading sales channels...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-2">
      {/* Page Header */}
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Sales Channels
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Performance analytics and insights per sales channel
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={loading || !data}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  <span className="text-sm font-semibold">Export Report</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExportAllChannels('pdf')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportAllChannels('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Export as Excel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue - Green */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent tabular-nums">
              {formatCurrency(data?.totals.revenue || 0)}
            </p>
          </div>
        </div>

        {/* Net Profit - Purple */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Net Profit</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent tabular-nums">
              {formatCurrency(data?.totals.profit || 0)}
            </p>
          </div>
        </div>

        {/* Transactions - Blue */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Transactions</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent tabular-nums">
              {formatNumber(data?.totals.transactions || 0)}
            </p>
          </div>
        </div>

        {/* Items Sold - Amber */}
        <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Items Sold</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-700 bg-clip-text text-transparent tabular-nums">
              {formatNumber(data?.totals.quantity || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Revenue by Channel Bar Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-1.5 md:p-2 rounded-[5px] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span className="text-base md:text-xl">Revenue by Channel</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
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
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution Pie Chart */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              <div className="p-1.5 md:p-2 rounded-[5px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
                <Store className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <span className="text-base md:text-xl">Revenue Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // Shorten label on mobile
                        const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name
                        return `${shortName}: ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      style={{ fontSize: '11px' }}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channels List */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            All Sales Channels ({data?.departments.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.departments && data.departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.departments.map((dept) => {
                const profitMargin = dept.revenue > 0 ? (dept.profit / dept.revenue) * 100 : 0
                const isPositive = dept.profit >= 0

                return (
                  <button
                    key={dept.name}
                    onClick={() => router.push(`/dashboard/sales-channels/${encodeURIComponent(dept.name)}?startDate=${startDate}&endDate=${endDate}`)}
                    className="text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={getChannelIcon(dept.name)}
                            alt={dept.name}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {dept.name}
                          </h3>
                          <Badge className={`${getTypeColor(dept.type)} text-xs mt-1`}>
                            {dept.type}
                          </Badge>
                        </div>
                      </div>
                      {isPositive ? (
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dept.revenue)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Profit</p>
                          <p className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(dept.profit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Margin</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {profitMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">COGS</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(dept.cost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">AOV</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {dept.transactions > 0 ? formatCurrency(dept.revenue / dept.transactions) : '₱0'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Transactions</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatNumber(dept.transactions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Items</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatNumber(dept.quantity)}
                          </p>
                        </div>
                      </div>

                      {/* Parcel Status Indicators */}
                      {dept.parcelStatus && dept.parcelStatus.total > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Parcel Status</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {dept.parcelStatus.pending}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {dept.parcelStatus.inTransit}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {dept.parcelStatus.delivered}
                              </span>
                            </div>
                            <div className="ml-auto">
                              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0">
                                {dept.parcelStatus.total > 0 
                                  ? `${((dept.parcelStatus.delivered / dept.parcelStatus.total) * 100).toFixed(0)}%`
                                  : '0%'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Sales Channels Found
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No transactions found for the selected date range
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
