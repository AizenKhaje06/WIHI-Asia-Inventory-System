"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#121212]">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link href="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
