'use client'

import { BrandLoader } from '@/components/ui/brand-loader'

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center min-h-[600px]">
      <div className="text-center">
        <BrandLoader size="lg" />
        <p className="text-slate-600 dark:text-slate-400 mt-6 text-sm font-medium">
          Loading packing queue...
        </p>
      </div>
    </div>
  )
}
