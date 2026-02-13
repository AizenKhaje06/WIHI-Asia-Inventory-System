"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BarChart3, Package, FileText } from "lucide-react"
import type { SalesReport } from "@/lib/types"
import { toast } from "sonner"
import { formatNumber } from "@/lib/utils"
import { apiGet } from "@/lib/api-client"

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch initial data but don't open modal
    loadInitialData()
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

  async function loadInitialData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const data = await apiGet<SalesReport>(`/api/reports?${params}`)
      setReport(data)
      // Don't open modal on initial load
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
      toast.error("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  async function fetchReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const data = await apiGet<SalesReport>(`/api/reports?${params}`)
      setReport(data)
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pt-6">
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
            <Button 
              onClick={fetchReport} 
              disabled={loading} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
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
