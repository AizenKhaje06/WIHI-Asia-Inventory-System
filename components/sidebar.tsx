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
  // Insights Section
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
    <div className="fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-b from-orange-500 to-black text-white flex flex-col shadow-sm">
      {/* Header */}
      <div className="h-[72px] flex items-center px-6 border-b border-white/10">
        <Warehouse className="h-8 w-8 text-white mr-3" strokeWidth={1.5} />
        <span className="text-xl font-bold text-white">Inventory Pro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-6 space-y-8">
        {/* Main Section */}
        <div>
          <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-4 px-3">
            Main
          </h3>
          <div className="space-y-1">
            {navigation.slice(0, 3).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-10 px-3 rounded-lg transition-all duration-200 ease-in-out group",
                    isActive
                      ? "bg-orange-500/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 mr-3">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Inventory Section */}
        <div>
          <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-4 px-3">
            Inventory
          </h3>
          <div className="space-y-1">
            {navigation.slice(3, 6).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-10 px-3 rounded-lg transition-all duration-200 ease-in-out group",
                    isActive
                      ? "bg-orange-500/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 mr-3">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Insights Section */}
        <div>
          <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-4 px-3">
            Insights
          </h3>
          <div className="space-y-1">
            {navigation.slice(6, 7).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-10 px-3 rounded-lg transition-all duration-200 ease-in-out group",
                    isActive
                      ? "bg-orange-500/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 mr-3">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Operations Section */}
        <div>
          <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-4 px-3">
            Operations
          </h3>
          <div className="space-y-1">
            {navigation.slice(7, 8).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-10 px-3 rounded-lg transition-all duration-200 ease-in-out group",
                    isActive
                      ? "bg-orange-500/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 mr-3">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center h-10 px-3 w-full text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 ease-in-out rounded-lg"
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 mr-3">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium">
            Logout
          </span>
        </Button>
      </div>
    </div>
  )
}
