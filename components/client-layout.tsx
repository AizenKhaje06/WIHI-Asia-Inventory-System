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
        <div className="relative flex h-screen">
          <div className="absolute inset-0 bg-[url('/Corporate%20Building.png')] bg-cover bg-center bg-no-repeat"></div>
          <div className="absolute inset-0 bg-background/60"></div>
          <div className="relative z-10 flex h-full w-full">
            {/* Menu Button */}
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4 z-20 m-2 bg-black/50 backdrop-blur-sm border-gray-800 text-white hover:bg-gray-800"
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
                "flex h-full flex-col border-r border-gray-800 bg-black/90 backdrop-blur-sm text-white transition-transform duration-300 z-20",
                isSidebarOpen ? "w-56 translate-x-0" : "-translate-x-full w-0"
              )}
            >
              <Sidebar onNavClick={closeSidebar} />
            </div>

            <main className={cn(
              "flex-1 overflow-auto p-6 transition-all duration-300",
              isSidebarOpen ? "ml-56" : "ml-0"
            )}>
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
