"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, AlertTriangle, XCircle, TrendingUp, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Point of Sales", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Products", href: "/dashboard/inventory", icon: Package },
  { name: "Low Stocks", href: "/dashboard/inventory/low-stock", icon: AlertTriangle },
  { name: "Out of Stocks", href: "/dashboard/inventory/out-of-stock", icon: XCircle },
  { name: "Sales Analytics", href: "/dashboard/sales", icon: TrendingUp },
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
    <div className="fixed left-0 top-0 h-screen w-[72px] min-w-[72px] max-w-[72px] bg-blue-600 text-white flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center h-16 px-2 py-2 relative hover:bg-white/10 transition-colors"
            >
              {isActive && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-purple-500 rounded-md w-13 h-full" />
              )}
              <item.icon className="h-5 w-5 mb-1 relative z-10" strokeWidth={1.5} />
              <span className="text-xs font-medium text-center relative z-10 leading-tight">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-16 px-2 py-2 w-full text-white hover:bg-white/10 transition-colors"
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <LogOut className="h-5 w-5 mb-1" strokeWidth={1.5} />
          <span className="text-xs font-medium text-center leading-tight">
            Logout
          </span>
        </Button>
      </div>
    </div>
  )
}
