"use client"

import type React from "react"
import { useState } from "react"
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
        <div className="flex h-screen bg-gradient-to-br from-white to-bg-white">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              flex h-screen flex-col border-r border-sidebar-border bg-gradient-dark text-white transition-all duration-300 ease-in-out
              fixed lg:static lg:flex-shrink-0 z-50 lg:z-auto
              ${sidebarOpen ? (sidebarCollapsed ? 'w-20' : 'w-full md:w-64') : 'w-0 lg:w-20 lg:translate-x-0'}
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
          </div>

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

            <main className="flex-1 overflow-auto pt-4 px-4 sm:px-6 pb-6">
              {children}
            </main>
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
