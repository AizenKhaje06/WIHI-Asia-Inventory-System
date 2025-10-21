"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import type { SalesReport } from "@/lib/types"

import { formatNumber } from "@/lib/utils"

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(false)

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
    } catch (error) {
      console.error("[v0] Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white dark:bg-black">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">SALES REPORT</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Recent transactions</p>
      </div>

      <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-slate-700 dark:text-slate-300 font-medium">Search Transactions</Label>
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
            <div className="flex gap-4">
              <div className="w-48">
                <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300 font-medium">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div className="w-48">
                <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300 font-medium">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
            </div>
            <Button onClick={fetchReport} disabled={loading} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground w-[15%]">Date</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground w-[25%]">Item</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground w-[8%]">Qty</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground w-[15%]">Revenue</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground w-[15%]">Cost</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground w-[22%]">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border last:border-0">
                        <td className="py-4 text-sm text-muted-foreground w-[15%]">
                          {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-4 text-sm text-foreground w-[25%]">{transaction.itemName}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[8%]">{formatNumber(transaction.quantity)}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[15%]">
                          ₱{formatNumber(transaction.totalRevenue)}
                        </td>
                        <td className="py-4 text-right text-sm text-foreground w-[15%]">₱{formatNumber(transaction.totalCost)}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[22%]">₱{formatNumber(transaction.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
