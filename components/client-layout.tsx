"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Clock } from "@/components/clock"
import { Suspense, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div>Loading...</div>}>
        <div className="relative flex min-h-screen bg-black">
          <div className="relative z-10 flex h-full w-full flex-1">
            {/* Menu Button */}
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-2 z-20 m-4 bg-black/50 backdrop-blur-sm border-gray-800 text-white hover:bg-gray-800"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Sidebar Overlay when open */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                onClick={closeSidebar}
              />
            )}

            {/* Sidebar */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 z-30 w-56 flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white transition-transform duration-300",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <Sidebar onNavClick={closeSidebar} />
            </div>

            <main className="flex-1 overflow-auto pt-16 px-6 pb-6 ml-0">
              {children}
            </main>
            <Clock />
          </div>
        </div>
        <Analytics />
      </Suspense>
    </ThemeProvider>
  )
}
