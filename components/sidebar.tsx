"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, AlertTriangle, XCircle, TrendingUp, FileText, LogOut, Warehouse } from "lucide-react"
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
    <div className="fixed left-0 top-0 h-screen w-[72px] bg-gradient-to-b from-orange-600 to-black text-white flex flex-col z-50">
      {/* Logo Container */}
      <div className="h-[72px] flex items-center justify-center">
        <Warehouse className="h-8 w-8 text-white" strokeWidth={1.5} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col">
        {/* Main Section */}
        <div className="mb-6">
          {navigation.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center h-[58px] mx-2 mb-1 rounded-xl transition-all duration-200 ease-in-out relative",
                  isActive
                    ? "bg-orange-400/20"
                    : "hover:bg-white/10"
                )}
                title={item.name}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-orange-400/20" />
                )}
                <div className="flex items-center justify-center w-5 h-5 mb-1 relative z-10">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight relative z-10">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Inventory Section */}
        <div className="mb-6">
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center h-[58px] mx-2 mb-1 rounded-xl transition-all duration-200 ease-in-out relative",
                  isActive
                    ? "bg-orange-400/20"
                    : "hover:bg-white/10"
                )}
                title={item.name}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-orange-400/20" />
                )}
                <div className="flex items-center justify-center w-5 h-5 mb-1 relative z-10">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight relative z-10">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Insights Section */}
        <div className="mb-6">
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center h-[58px] mx-2 mb-1 rounded-xl transition-all duration-200 ease-in-out relative",
                  isActive
                    ? "bg-orange-400/20"
                    : "hover:bg-white/10"
                )}
                title={item.name}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-orange-400/20" />
                )}
                <div className="flex items-center justify-center w-5 h-5 mb-1 relative z-10">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight relative z-10">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Operations Section */}
        <div className="mb-6">
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center justify-center h-[58px] mx-2 mb-1 rounded-xl transition-all duration-200 ease-in-out relative",
                  isActive
                    ? "bg-orange-400/20"
                    : "hover:bg-white/10"
                )}
                title={item.name}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-orange-400/20" />
                )}
                <div className="flex items-center justify-center w-5 h-5 mb-1 relative z-10">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight relative z-10">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="mt-auto mb-4">
        <button
          className="flex flex-col items-center justify-center h-[58px] mx-2 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/10"
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
          title="Logout"
        >
          <div className="flex items-center justify-center w-5 h-5 mb-1">
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-center leading-tight">
            Logout
          </span>
        </button>
      </div>
    </div>
  )
}
