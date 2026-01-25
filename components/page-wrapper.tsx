"use client"

import * as React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface PageWrapperProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

export function PageWrapper({ children, showBreadcrumbs = true }: PageWrapperProps) {
  return (
    <>
      {showBreadcrumbs && <Breadcrumbs />}
      {children}
    </>
  )
}
