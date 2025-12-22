"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, AlertTriangle, XCircle, TrendingUp, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  // Main Section
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Point of Sales", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/dashboard/reports", icon: BarChart3 },
  // Products Section
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

export function Sidebar({ onNavClick, collapsed, onToggleCollapse: _onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = (_e: React.MouseEvent) => {
    onNavClick?.()
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-[50px] bg-[#1a1a2e] text-white flex flex-col" style={{ fontFamily: 'Inter, Roboto, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 shrink-0">
        {!collapsed && (
          <h1 className="text-lg font-semibold text-white truncate flex-1 min-w-0">
            Inventory Pro
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Main Section */}
        <div className="py-1">
          {!collapsed && (
            <div className="px-4 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wider">
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
                  "flex items-center w-full text-white transition-all duration-200",
                  "py-[10px] px-4 font-normal text-[14px]",
                  isActive
                    ? "bg-[#8b7cf8] rounded-[6px]"
                    : "hover:bg-white/5"
                )}
              >
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                  <span className="ml-3 truncate" style={{ whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Inventory Section */}
        <div className="py-1">
          {!collapsed && (
            <div className="px-4 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wider">
              Inventory
            </div>
          )}
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center w-full text-white transition-all duration-200",
                  "py-[10px] px-4 font-normal text-[14px]",
                  isActive
                    ? "bg-[#8b7cf8] rounded-[6px]"
                    : "hover:bg-white/5"
                )}
              >
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                  <span className="ml-3 truncate" style={{ whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Cash Flow Section */}
        <div className="py-1">
          {!collapsed && (
            <div className="px-4 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wider">
              Cash Flow
            </div>
          )}
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center w-full text-white transition-all duration-200",
                  "py-[10px] px-4 font-normal text-[14px]",
                  isActive
                    ? "bg-[#8b7cf8] rounded-[6px]"
                    : "hover:bg-white/5"
                )}
              >
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                  <span className="ml-3 truncate" style={{ whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Operation Section */}
        <div className="py-1">
          {!collapsed && (
            <div className="px-4 py-1 text-[11px] font-medium text-white/50 uppercase tracking-wider">
              Operation
            </div>
          )}
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center w-full text-white transition-all duration-200",
                  "py-[10px] px-4 font-normal text-[14px]",
                  isActive
                    ? "bg-[#8b7cf8] rounded-[6px]"
                    : "hover:bg-white/5"
                )}
              >
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                  <span className="ml-3 truncate" style={{ whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center w-full text-white transition-all py-[10px] px-4 rounded-[6px] font-normal text-[14px] hover:bg-white/5"
          )}
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <div className="w-6 flex-shrink-0 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          {!collapsed && (
            <span className="ml-3 truncate" style={{ whiteSpace: 'nowrap' }}>
              Logout
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
