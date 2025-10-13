"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SalesReport } from "@/lib/types"
import { DollarSign, TrendingUp, Percent } from "lucide-react"

export default function ReportsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

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
    <div className="p-8 bg-gradient-to-b from-white to-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Sales Reports</h1>
        <p className="text-muted-foreground">View sales analytics and COGS</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-foreground">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate" className="text-foreground">
                Start Date
              </Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate" className="text-foreground">
                End Date
              </Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₱{report.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost (COGS)</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₱{report.totalCost.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₱{report.totalProfit.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
                <Percent className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{report.profitMargin.toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Transactions ({report.transactions.length})</CardTitle>
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
                    {report.transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border last:border-0">
                        <td className="py-4 text-sm text-muted-foreground w-[15%]">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-sm text-foreground w-[25%]">{transaction.itemName}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[8%]">{transaction.quantity}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[15%]">
                          ₱{transaction.totalRevenue.toFixed(2)}
                        </td>
                        <td className="py-4 text-right text-sm text-foreground w-[15%]">₱{transaction.totalCost.toFixed(2)}</td>
                        <td className="py-4 text-right text-sm text-foreground w-[22%]">₱{transaction.profit.toFixed(2)}</td>
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
