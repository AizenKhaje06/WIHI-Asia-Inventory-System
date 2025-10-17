"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { LayoutDashboard, ShoppingCart, BarChart3, Package, Tags, PackagePlus, AlertTriangle, XCircle, TrendingUp, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"


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
  { name: "Daily Sales", href: "/dashboard/analytics", icon: TrendingUp },
  // Operation Section
  { name: "Logs", href: "/dashboard/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = (e: React.MouseEvent) => {
    onNavClick?.()
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r",
      "border-border bg-gradient-dark text-white"
    )}>
      <div className={cn("flex h-16 items-center justify-center border-b px-4",
        "border-sidebar-border"
      )}>
        <h1 className="text-xl font-semibold">Inventory Pro</h1>
      </div>
      <nav className="flex-1 space-y-4 p-2">
        {/* Main Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Main</div>
          {navigation.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Inventory Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Inventory</div>
          {navigation.slice(3, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Cash Flow Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Cash Flow</div>
          {navigation.slice(6, 7).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", "bg-white/20")} />
        </div>

        {/* Operation Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Operation</div>
          {navigation.slice(7, 8).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : "text-orange-400"
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className={cn("border-t p-2", "border-white/20")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center gap-2 w-full transition-all py-2 px-2 justify-start",
            "text-white hover:bg-white/10 hover:text-white"
          )}
          onClick={() => {
            localStorage.removeItem("isLoggedIn")
            window.location.href = "/"
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>

    </div>
  )
}
