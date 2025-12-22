"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, AlertTriangle, XCircle, TrendingUp, FileText, LogOut, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  // Main Section
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Point of Sales", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/dashboard/reports", icon: BarChart3 },
  // Inventory Section
  { name: "Products", href: "/dashboard/inventory", icon: Package },
  { name: "Low Stocks", href: "/dashboard/inventory/low-stock", icon: AlertTriangle },
  { name: "Out of Stocks", href: "/dashboard/inventory/out-of-stock", icon: XCircle },
  // Analytics Section
  { name: "Sales Analytics", href: "/dashboard/sales", icon: TrendingUp },
  // Operations Section
  { name: "Logs", href: "/dashboard/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = (_e: React.MouseEvent) => {
    onNavClick?.()
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-[72px] min-w-[72px] max-w-[72px] bg-gradient-to-b from-orange-500 to-black text-white flex flex-col">
      {/* Logo */}
      <div className="h-[72px] flex items-center justify-center border-b border-white/10">
        <Warehouse className="h-8 w-8 text-white" strokeWidth={1.5} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-2 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-2">
          {navigation.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center h-[58px] relative hover:bg-white/10 transition-colors rounded-lg"
              >
                {isActive && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-orange-300 rounded-xl w-[52px] h-full" />
                )}
                <item.icon className="h-5 w-5 mb-1 relative z-10" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-center relative z-10 leading-tight">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Inventory Section */}
        <div className="space-y-2">
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center h-[58px] relative hover:bg-white/10 transition-colors rounded-lg"
              >
                {isActive && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-orange-300 rounded-xl w-[52px] h-full" />
                )}
                <item.icon className="h-5 w-5 mb-1 relative z-10" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-center relative z-10 leading-tight">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Analytics Section */}
        <div className="space-y-2">
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center h-[58px] relative hover:bg-white/10 transition-colors rounded-lg"
              >
                {isActive && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-orange-300 rounded-xl w-[52px] h-full" />
                )}
                <item.icon className="h-5 w-5 mb-1 relative z-10" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-center relative z-10 leading-tight">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Operations Section */}
        <div className="space-y-2">
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className="flex flex-col items-center justify-center h-[58px] relative hover:bg-white/10 transition-colors rounded-lg"
              >
                {isActive && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-orange-300 rounded-xl w-[52px] h-full" />
                )}
                <item.icon className="h-5 w-5 mb-1 relative z-10" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-center relative z-10 leading-tight">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="mt-auto p-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-[58px] w-full text-white hover:bg-white/10 transition-colors rounded-lg"
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <LogOut className="h-5 w-5 mb-1" strokeWidth={1.5} />
          <span className="text-[11px] font-medium text-center leading-tight">
            Logout
          </span>
        </Button>
      </div>
    </div>
  )
}
