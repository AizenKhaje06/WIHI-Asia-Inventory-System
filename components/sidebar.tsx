"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"
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

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const iconClass = "h-5 w-5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent flex-shrink-0"

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white transition-all duration-300",
        isHovered ? "w-56" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("flex h-16 items-center border-b border-gray-800 px-4 transition-all duration-300", isHovered ? "px-6" : "justify-center")}>
        {isHovered && <h1 className="text-xl font-semibold">Inventory Pro</h1>}
      </div>
      <nav className={cn("flex-1 space-y-1 p-2 transition-all duration-300", isHovered ? "p-4" : "p-2")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg py-2 transition-all duration-300",
                isHovered 
                  ? "gap-3 px-3 text-sm font-medium" 
                  : "gap-0 px-2 justify-center",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <item.icon className={cn(iconClass, isActive ? "text-white" : "")} />
              {isHovered && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className={cn("p-2 border-t border-gray-800 transition-all duration-300", isHovered ? "p-4" : "p-2")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start transition-all duration-300 text-white hover:bg-gray-800",
            isHovered ? "" : "justify-center"
          )}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className={cn("h-4 w-4", iconClass)} /> : <Moon className={cn("h-4 w-4", iconClass)} />}
          {isHovered && <span className="ml-2 capitalize">Toggle Theme</span>}
        </Button>
      </div>
    </div>
  )
}
