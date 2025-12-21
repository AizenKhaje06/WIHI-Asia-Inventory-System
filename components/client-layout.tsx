"use client"

import type React from "react"
import { useState } from "react"
import * as React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Clock } from "@/components/clock"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Auto-collapse sidebar on smaller screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Auto-collapse on tablet and below
        setSidebarCollapsed(true)
      } else {
        // Expand sidebar on desktop
        setSidebarCollapsed(false)
      }
    }

    // Check on mount
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    // Trigger window resize for charts to resize properly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300) // Match transition duration
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-white to-bg-white">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              flex-shrink-0 flex h-full flex-col border-r border-white/10 bg-[#1a1a2e] text-white transition-all duration-300 ease-in-out
              fixed lg:relative z-50 lg:z-auto
              ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:translate-x-0'}
              ${sidebarCollapsed ? 'lg:w-16 xl:w-20' : 'lg:w-64'}
              max-w-full
            `}
          >
            <div className="flex items-center justify-between p-4 lg:hidden">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar onNavClick={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onToggleCollapse={handleToggleCollapse} />
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top bar for mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Clock />
            </div>

            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 px-3 sm:px-4 md:px-6 pb-6 min-w-0 w-full">
              <div className="w-full max-w-full min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
