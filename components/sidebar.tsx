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
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Log", href: "/log", icon: FileText },
]

interface SidebarProps {
  onNavClick?: () => void
  isHovered?: boolean
}

export function Sidebar({ onNavClick, isHovered = false }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const iconClass = "h-5 w-5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent flex-shrink-0"

  const handleNavClick = (e: React.MouseEvent) => {
    onNavClick?.()
  }

  const handleThemeClick = (e: React.MouseEvent) => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    onNavClick?.()
  }

  return (
    <div className="flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white">
      <div className={cn("flex h-16 items-center justify-center border-b border-gray-800", isHovered ? "px-4" : "px-2")}>
        {isHovered ? (
          <h1 className="text-xl font-semibold">Inventory Pro</h1>
        ) : (
          <div className="w-4 h-4 bg-[#00fff6] rounded" />
        )}
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
                "flex items-center justify-center gap-2 rounded-lg py-2 px-2 text-xs font-medium transition-colors w-full",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                !isHovered && "justify-center px-1 py-2 gap-0"
              )}
            >
              <item.icon className={cn(iconClass, isActive ? "text-white" : "")} />
              {isHovered && <span className="text-center">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className={cn("border-t border-gray-800", isHovered ? "p-2" : "p-1")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center justify-center gap-2 w-full text-white hover:bg-gray-800 transition-all py-2 px-2",
            !isHovered && "px-1 gap-0"
          )}
          onClick={handleThemeClick}
        >
          {theme === 'dark' ? <Sun className={cn("h-4 w-4", iconClass)} /> : <Moon className={cn("h-4 w-4", iconClass)} />}
          {isHovered && <span className="capitalize">Toggle Theme</span>}
        </Button>
      </div>
    </div>
  )
}
