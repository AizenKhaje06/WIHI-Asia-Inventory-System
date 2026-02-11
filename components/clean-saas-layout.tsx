"use client"

import { useState } from "react"
import { CleanSaaSSidebar } from "@/components/clean-saas-sidebar"
import { CleanSaaSHeader } from "@/components/clean-saas-header"
import { cn } from "@/lib/utils"

export default function CleanSaaSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <CleanSaaSSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Header */}
      <CleanSaaSHeader
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 transition-all duration-200",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
