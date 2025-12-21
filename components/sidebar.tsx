"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, Tags, PackagePlus, AlertTriangle, XCircle, TrendingUp, FileText, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"


const navigation = [
  // Main Section
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Point of Sales", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/dashboard/reports", icon: BarChart3 },
  // Products Section (renamed from Inventory)
  { name: "Products", href: "/dashboard/inventory", icon: Package },
  { name: "Low Stocks", href: "/dashboard/inventory/low-stock", icon: AlertTriangle },
  { name: "Out of Stocks", href: "/dashboard/inventory/out-of-stock", icon: XCircle },
  // Cash Flow Section
  { name: "Sales Analytics", href: "/dashboard/sales", icon: TrendingUp },
  // Operation Section
  { name: "Logs", href: "/dashboard/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ onNavClick, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = (e: React.MouseEvent) => {
    onNavClick?.()
  }

  return (
    <div className={cn(
      "flex h-full flex-col",
      "bg-[#1a1a2e] text-white"
    )}>
      <div className={cn("flex h-16 items-center justify-between border-b px-3 sm:px-4",
        "border-white/10 shrink-0"
      )}>
        {!collapsed && (
          <h1 className="text-base sm:text-lg font-semibold text-white truncate flex-1 min-w-0">
            Inventory Pro
          </h1>
        )}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-white/70 hover:bg-white/10 hover:text-white lg:flex hidden h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-2 sm:p-3 overflow-y-auto overflow-x-hidden">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <div className="px-2 sm:px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider mb-1 truncate">
              Main
            </div>
          )}
          {navigation.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "relative flex items-center rounded-md py-2 px-2 sm:px-3 text-sm font-medium transition-all duration-200 w-full group min-w-0",
                  collapsed ? "justify-center" : "gap-2 sm:gap-3",
                  isActive
                    ? "bg-[#6d4cff] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="flex-1 truncate min-w-0" title={item.name}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Inventory Section */}
        <div className="mt-4">
          {!collapsed && <div className="px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Inventory</div>}
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "relative flex items-center rounded-md py-2 px-2 sm:px-3 text-sm font-medium transition-all duration-200 w-full group min-w-0",
                  collapsed ? "justify-center" : "gap-2 sm:gap-3",
                  isActive
                    ? "bg-[#6d4cff] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="flex-1 truncate min-w-0" title={item.name}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Cash Flow Section */}
        <div className="mt-4">
          {!collapsed && <div className="px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Cash Flow</div>}
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "relative flex items-center rounded-md py-2 px-2 sm:px-3 text-sm font-medium transition-all duration-200 w-full group min-w-0",
                  collapsed ? "justify-center" : "gap-2 sm:gap-3",
                  isActive
                    ? "bg-[#6d4cff] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="flex-1 truncate min-w-0" title={item.name}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Operation Section */}
        <div className="mt-4">
          {!collapsed && <div className="px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Operation</div>}
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "relative flex items-center rounded-md py-2 px-2 sm:px-3 text-sm font-medium transition-all duration-200 w-full group min-w-0",
                  collapsed ? "justify-center" : "gap-2 sm:gap-3",
                  isActive
                    ? "bg-[#6d4cff] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="flex-1 truncate min-w-0" title={item.name}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className={cn("border-t p-2 sm:p-3 shrink-0", "border-white/10")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center w-full transition-all py-2 px-2 sm:px-3 rounded-md min-w-0",
            collapsed ? "justify-center" : "gap-2 sm:gap-3 justify-start",
            "text-white/70 hover:bg-white/5 hover:text-white"
          )}
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate min-w-0">Logout</span>}
        </Button>
      </div>

    </div>
  )
}
