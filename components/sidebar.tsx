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
      "flex h-full flex-col border-r",
      "border-border bg-gradient-dark text-white",
      "w-full md:w-64"
    )}>
      <div className={cn("flex h-16 items-center justify-between border-b px-4",
        "border-sidebar-border"
      )}>
        {!collapsed && <h1 className="text-lg sm:text-xl font-semibold">Inventory Pro</h1>}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-white hover:bg-white/10 lg:flex hidden"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex-1 space-y-4 p-2">
        {/* Main Section */}
        <div>
          {!collapsed && <div className="px-2 py-1 text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Main</div>}
          {navigation.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  collapsed ? "justify-center" : "gap-2",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Inventory Section */}
        <div>
          {!collapsed && <div className="px-2 py-1 text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Inventory</div>}
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  collapsed ? "justify-center" : "gap-2",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Cash Flow Section */}
        <div>
          {!collapsed && <div className="px-2 py-1 text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Cash Flow</div>}
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  collapsed ? "justify-center" : "gap-2",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Operation Section */}
        <div>
          {!collapsed && <div className="px-2 py-1 text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Operation</div>}
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  collapsed ? "justify-center" : "gap-2",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
      <div className={cn("border-t p-2", "border-white/20")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center w-full transition-all py-2 px-2",
            collapsed ? "justify-center" : "gap-2 justify-start",
            "text-white hover:bg-white/10 hover:text-white"
          )}
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>

    </div>
  )
}
