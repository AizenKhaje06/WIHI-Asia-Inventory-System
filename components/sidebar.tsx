"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { LayoutDashboard, ShoppingCart, BarChart3, Package, Tags, PackagePlus, AlertTriangle, XCircle, TrendingUp, FileText, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navigation = [
  // Main Section
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Point of Sales", href: "/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/reports", icon: BarChart3 },
  // Products Section (renamed from Inventory)
  { name: "Products", href: "/inventory", icon: Package },
  { name: "Low Stocks", href: "/inventory/low-stock", icon: AlertTriangle },
  { name: "Out of Stocks", href: "/inventory/out-of-stock", icon: XCircle },
  // Cash Flow Section
  { name: "Daily Sales", href: "/analytics", icon: TrendingUp },
  // Operation Section
  { name: "Logs", href: "/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const handleNavClick = (e: React.MouseEvent) => {
    onNavClick?.()
  }

  const handleThemeClick = (e: React.MouseEvent) => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    onNavClick?.()
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r",
      theme === 'light'
        ? "border-gray-200 bg-gray-100 text-gray-800"
        : "border-gray-800 bg-black/90 text-white backdrop-blur-sm"
    )}>
      <div className={cn("flex h-16 items-center justify-center border-b px-4",
        theme === 'light' ? "border-gray-200" : "border-gray-800"
      )}>
        <h1 className="text-xl font-semibold">Inventory Pro</h1>
      </div>
      <nav className="flex-1 space-y-4 p-2">
        {/* Main Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</div>
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
                    ? (theme === 'light' ? "bg-slate-900 text-white" : "bg-orange-500 text-white")
                    : (theme === 'light' ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900" : "text-gray-300 hover:bg-gray-800 hover:text-white")
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : (theme === 'light' ? "text-slate-700" : "text-[#00fff6]")
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", theme === 'light' ? "bg-gray-200" : "bg-gray-700")} />
        </div>

        {/* Products Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products</div>
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
                    ? (theme === 'light' ? "bg-slate-900 text-white" : "bg-orange-500 text-white")
                    : (theme === 'light' ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900" : "text-gray-300 hover:bg-gray-800 hover:text-white")
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : (theme === 'light' ? "text-slate-700" : "text-[#00fff6]")
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", theme === 'light' ? "bg-gray-200" : "bg-gray-700")} />
        </div>

        {/* Cash Flow Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cash Flow</div>
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
                    ? (theme === 'light' ? "bg-slate-900 text-white" : "bg-orange-500 text-white")
                    : (theme === 'light' ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900" : "text-gray-300 hover:bg-gray-800 hover:text-white")
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : (theme === 'light' ? "text-slate-700" : "text-[#00fff6]")
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Separator className={cn("my-2", theme === 'light' ? "bg-gray-200" : "bg-gray-700")} />
        </div>

        {/* Operation Section */}
        <div>
          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Operation</div>
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
                    ? (theme === 'light' ? "bg-slate-900 text-white" : "bg-orange-500 text-white")
                    : (theme === 'light' ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900" : "text-gray-300 hover:bg-gray-800 hover:text-white")
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : (theme === 'light' ? "text-slate-700" : "text-[#00fff6]")
                )} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className={cn("border-t p-2", theme === 'light' ? "border-gray-200" : "border-gray-800")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center gap-2 w-full transition-all py-2 px-2",
            theme === 'light'
              ? "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              : "text-white hover:bg-gray-800"
          )}
          onClick={handleThemeClick}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-[#00fff6]" /> : <Moon className="h-4 w-4 text-slate-700" />}
          <span className="capitalize">Toggle Theme</span>
        </Button>
      </div>
    </div>
  )
}
