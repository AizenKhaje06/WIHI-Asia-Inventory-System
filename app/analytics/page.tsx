"use client"

import { useState } from "react"
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
  RadialBarChart,
  RadialBar,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Top cards data
const stats = [
  { title: "Current Purchases", value: "2,07k", icon: Users, color: "text-blue-600" },
  { title: "Current Purchase Value", value: "₱55.20", icon: DollarSign, color: "text-green-600" },
  { title: "Average Purchase Value", value: "₱46.57", icon: DollarSign, color: "text-green-600" },
  { title: "Win Rate", value: "30%", icon: Target, color: "text-orange-600" },
]

// Line chart data for Average Monthly Sales
const monthlySalesData = [
  { month: "Jan", sales: 400 },
  { month: "Feb", sales: 300 },
  { month: "Mar", sales: 500 },
  { month: "Apr", sales: 280 },
  { month: "May", sales: 600 },
  { month: "Jun", sales: 779 },
]

// Donut chart data for Average Weekly Sales
const weeklySalesData = [
  { name: "Week 1", value: 400 },
  { name: "Week 2", value: 300 },
  { name: "Week 3", value: 200 },
  { name: "Week 4", value: 278 },
]

// Bar chart data for Sales Growth vs Target
const growthData = [
  { month: "Jan", sales: 400, target: 500 },
  { month: "Feb", sales: 300, target: 450 },
  { month: "Mar", sales: 500, target: 550 },
  { month: "Apr", sales: 280, target: 400 },
  { month: "May", sales: 600, target: 650 },
  { month: "Jun", sales: 779, target: 800 },
]

// Pie chart data for Country Performance
const countryData = [
  { name: "United States", value: 40, fill: "#0088FE" },
  { name: "Canada", value: 30, fill: "#00C49F" },
  { name: "UK", value: 20, fill: "#FFBB28" },
  { name: "Germany", value: 10, fill: "#FF8042" },
]

export default function AnalyticsPage() {
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
                <Tooltip />
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
                <Tooltip />
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
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Country Performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sales Country Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
