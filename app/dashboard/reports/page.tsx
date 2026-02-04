"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, BarChart3, Package, FileText, Download, FileSpreadsheet } from "lucide-react"
import type { SalesReport } from "@/lib/types"
import { toast } from "sonner"
import { formatNumber } from "@/lib/utils"

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

  useEffect(() => {
    if (report?.transactions) {
      let filtered = report.transactions

      if (search) {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter(
          (transaction) =>
            transaction.itemName.toLowerCase().includes(searchLower),
        )
      }

      setFilteredTransactions(filtered)
    }
  }, [search, report])

  async function fetchReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const res = await fetch(`/api/reports?${params}`)
      const data = await res.json()
      setReport(data)
      
      // Open export modal after report is generated
      setExportModalOpen(true)
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error("No data to export")
      return
    }

    const headers = ["Date", "Time", "Item", "Quantity", "Revenue", "Cost", "Profit"]
    const rows = filteredTransactions.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      new Date(t.timestamp).toLocaleTimeString(),
      t.itemName,
      t.quantity,
      t.totalRevenue,
      t.totalCost,
      t.profit
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("CSV exported successfully!")
    setExportModalOpen(false)
  }

  async function exportToPDF() {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      toast.info("Generating PDF...")
      
      // Dynamic import to reduce bundle size
      const { exportSalesReportPDF } = await import("@/lib/pdf-export")
      
      await exportSalesReportPDF({
        transactions: filteredTransactions,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        totalRevenue: report?.totalRevenue || 0,
        totalCost: report?.totalCost || 0,
        totalProfit: report?.totalProfit || 0,
        totalOrders: report?.totalOrders || 0
      })
      
      toast.success("PDF exported successfully!")
      setExportModalOpen(false)
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("Failed to export PDF")
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Sales Report
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Recent transactions and detailed sales reports
        </p>
      </div>

      <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search" className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">Search Transactions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by item name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
            </div>
            <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={fetchReport} 
                  disabled={loading} 
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                >
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold gradient-text">Export Report</DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Choose your preferred export format
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <Button
                    onClick={exportToCSV}
                    className="h-16 gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Export as CSV</div>
                      <div className="text-xs opacity-90">Excel-compatible spreadsheet</div>
                    </div>
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    className="h-16 gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Export as PDF</div>
                      <div className="text-xs opacity-90">Professional report document</div>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-[5px] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Recent Transactions ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-full inline-block align-middle">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Date</th>
                        <th className="pb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Item</th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Qty</th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Revenue</th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Cost</th>
                        <th className="pb-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                          <td className="py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-[200px] truncate" title={transaction.itemName}>
                            {transaction.itemName}
                          </td>
                          <td className="py-4 text-right text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatNumber(transaction.quantity)}</td>
                          <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            ₱{formatNumber(transaction.totalRevenue)}
                          </td>
                          <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">₱{formatNumber(transaction.totalCost)}</td>
                          <td className="py-4 text-right text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">₱{formatNumber(transaction.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
