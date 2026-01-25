"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumbs on login page or root dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    return null
  }

  return (
    <nav 
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-500" 
      aria-label="Breadcrumb"
    >
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      
      {segments.map((segment, i) => {
        // Skip 'dashboard' in breadcrumb display
        if (segment === 'dashboard') return null
        
        const href = `/${segments.slice(0, i + 1).join('/')}`
        const isLast = i === segments.length - 1
        const label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
        
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground px-2 py-1">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
