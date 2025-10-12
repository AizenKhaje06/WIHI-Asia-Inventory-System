"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Activity, Sun, Moon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "Transactions", href: "/reports", icon: BarChart3 },
  { name: "Daily Sales", href: "/analytics", icon: Activity },
  { name: "Log", href: "/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
  isHovered?: boolean
}

export function Sidebar({ onNavClick, isHovered = false }: SidebarProps) {
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
    <div className="flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
        <h1 className="text-xl font-semibold">Inventory Pro</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2 rounded-lg py-2 px-2 text-xs font-medium transition-colors w-full",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                isActive ? "h-5 w-5 text-white flex-shrink-0" : "h-5 w-5 text-[#00fff6] flex-shrink-0"
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full text-white hover:bg-gray-800 transition-all py-2 px-2"
          onClick={handleThemeClick}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-[#00fff6]" /> : <Moon className="h-4 w-4 text-[#00fff6]" />}
          <span className="capitalize">Toggle Theme</span>
        </Button>
      </div>
    </div>
  )
}
