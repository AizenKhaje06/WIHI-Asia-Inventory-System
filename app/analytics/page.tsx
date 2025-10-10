"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, Target } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

import type { SalesReport, InventoryItem, Transaction } from "@/lib/types"

export default function AnalyticsPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlySalesData, setMonthlySalesData] = useState<{ month: string; sales: number }[]>([])
  const [weeklySalesData, setWeeklySalesData] = useState<{ name: string; value: number }[]>([])
  const [growthData, setGrowthData] = useState<{ month: string; sales: number; target: number }[]>([])
  const [productData, setProductData] = useState<{ name: string; value: number; fill: string }[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [reportRes, itemsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/items")
        ])

        const reportData = await reportRes.json()
        const itemsData = await itemsRes.json()

        setReport(reportData)
        setItems(itemsData)

        // Compute monthly sales (last 6 months)
        const salesTransactions = reportData.transactions.filter((t: Transaction) => t.type === "sale")
        const monthlyMap = new Map<string, number>()
        salesTransactions.forEach((t: Transaction) => {
          const date = new Date(t.timestamp)
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + t.totalRevenue)
        })
        const sortedMonthly: [string, number][] = Array.from(monthlyMap.entries())
          .sort((a, b) => new Date(a[0] + ' 1').getTime() - new Date(b[0] + ' 1').getTime())
          .slice(-6) // Last 6 months
        setMonthlySalesData(sortedMonthly.map(([month, sales]) => ({ month, sales })))

        // Compute weekly sales (last 4 weeks)
        const now = new Date()
        const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)
        const weeklyMap = new Map<string, number>()
        salesTransactions
          .filter((t: Transaction) => new Date(t.timestamp) >= fourWeeksAgo)
          .forEach((t: Transaction) => {
            const date = new Date(t.timestamp)
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay())) // Sunday start
            const weekKey = `Week ${Math.ceil((now.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))}`
            weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + t.totalRevenue)
          })
        const sortedWeekly: [string, number][] = Array.from(weeklyMap.entries()).slice(-4).reverse()
        setWeeklySalesData(sortedWeekly.map(([name, value]) => ({ name, value })))

        // Compute growth vs target (using monthly data)
        const growth = sortedMonthly.map((m, index) => {
          const month = m[0]
          const sales = m[1]
          const prevSales = index > 0 ? sortedMonthly[index - 1][1] : sales
          const target = prevSales * 1.1 // 10% growth target
          return { month, sales, target }
        })
        setGrowthData(growth)

        // Compute product performance by category (top 4)
        const categoryMap = new Map<string, number>()
        salesTransactions.forEach((t: Transaction) => {
          const item = itemsData.find((i: InventoryItem) => i.id === t.itemId)
          const category = item?.category || 'Unknown'
          categoryMap.set(category, (categoryMap.get(category) || 0) + t.totalRevenue)
        })
        const sortedCategories: [string, number][] = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
        setProductData(sortedCategories.map(([name, value], index) => ({
          name,
          value,
          fill: COLORS[index % COLORS.length]
        })))

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

      {/* Middle Charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Line Chart - Average Monthly Sales */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Average Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Sales']} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart - Average Weekly Sales */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Average Weekly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={weeklySalesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {weeklySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Sales Growth vs Target */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sales Growth vs Target Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Sales']} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Product Performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
