"use client"

import type React from "react"
import { useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Clock } from "@/components/clock"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="relative flex min-h-screen bg-gradient-to-br from-white to-bg-white">
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
              fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-gradient-dark text-white transition-transform duration-300 ease-in-out
              w-64 lg:w-52
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
            <Sidebar onNavClick={() => setSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
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

            <main className="flex-1 overflow-auto pt-4 px-4 sm:px-6 pb-6 lg:ml-52">
              {children}
            </main>
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
