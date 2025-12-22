"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, AlertTriangle, XCircle, TrendingUp, FileText, LogOut, Warehouse, ChevronLeft, ChevronRight } from "lucide-react"
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
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ onNavClick, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNavClick = (_e: React.MouseEvent) => {
    onNavClick?.()
  }

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-gradient-to-b from-orange-600 to-black text-white flex flex-col transition-all duration-300 ease-in-out z-50",
      isCollapsed ? "w-[72px]" : "w-[280px]"
    )}>
      {/* Header */}
      <div className="h-[72px] flex items-center justify-between px-4 border-b border-white/20">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <Warehouse className="h-8 w-8 text-white" strokeWidth={1.5} />
            <span className="text-lg font-bold text-white">Inventory Pro</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex-1 flex justify-center">
            <Warehouse className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="h-8 w-8 text-white hover:bg-white/10 transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-3 px-2">
              Main
            </h3>
          )}
          <div className="space-y-1">
            {navigation.slice(0, 3).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-[56px] rounded-xl transition-all duration-200 ease-in-out group relative",
                    isCollapsed ? "justify-center px-3" : "px-4",
                    isActive
                      ? "bg-orange-500/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r-full" />
                  )}
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Inventory Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-3 px-2">
              Inventory
            </h3>
          )}
          <div className="space-y-1">
            {navigation.slice(3, 6).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-[56px] rounded-xl transition-all duration-200 ease-in-out group relative",
                    isCollapsed ? "justify-center px-3" : "px-4",
                    isActive
                      ? "bg-orange-500/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r-full" />
                  )}
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Insights Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-3 px-2">
              Insights
            </h3>
          )}
          <div className="space-y-1">
            {navigation.slice(6, 7).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-[56px] rounded-xl transition-all duration-200 ease-in-out group relative",
                    isCollapsed ? "justify-center px-3" : "px-4",
                    isActive
                      ? "bg-orange-500/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r-full" />
                  )}
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Operations Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wider mb-3 px-2">
              Operations
            </h3>
          )}
          <div className="space-y-1">
            {navigation.slice(7, 8).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center h-[56px] rounded-xl transition-all duration-200 ease-in-out group relative",
                    isCollapsed ? "justify-center px-3" : "px-4",
                    isActive
                      ? "bg-orange-500/20 text-white shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r-full" />
                  )}
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
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
          className={cn(
            "flex items-center h-[56px] rounded-xl transition-all duration-200 ease-in-out w-full",
            isCollapsed ? "justify-center px-3" : "px-4",
            "text-white/60 hover:text-white hover:bg-white/5"
          )}
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
          title={isCollapsed ? "Logout" : undefined}
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </div>
          {!isCollapsed && (
            <span className="ml-4 text-sm font-medium">
              Logout
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
