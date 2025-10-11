"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Target } from "lucide-react"

import type { SalesReport } from "@/lib/types"

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const reportRes = await fetch("/api/reports")

        const reportData = await reportRes.json()

        console.log("[Analytics Debug] Report Data:", reportData)

        setReport(reportData)

      } catch (error) {
        console.error("[Analytics] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  const totalRevenue = report?.totalRevenue ?? 0
  const itemsSold = report?.itemsSold ?? 0
  const profitMargin = report?.profitMargin ?? 0
  const avgPurchaseValue = itemsSold > 0 ? totalRevenue / itemsSold : 0
  const stats = [
    { title: "Current Purchases", value: itemsSold.toLocaleString(), icon: Users, color: "text-blue-600" },
    { title: "Current Purchase Value", value: `₱${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Average Purchase Value", value: `₱${avgPurchaseValue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Win Rate", value: `${profitMargin.toFixed(1)}%`, icon: Target, color: "text-orange-600" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sales and performance analytics</p>
      </div>

      {/* Top Cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
