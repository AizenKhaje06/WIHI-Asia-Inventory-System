"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export function SetupRequiredAlert() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="ml-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Google Sheets Configuration Required
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              The application needs Google Sheets API credentials to store and retrieve data. 
              Please configure your <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100">.env.local</code> file with your Google Sheets credentials.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="shrink-0 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
            asChild
          >
            <a 
              href="https://github.com/AizenKhaje06/WIHI-Asia-Inventory-System/blob/main/SETUP_GOOGLE_SHEETS.md" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Setup Guide
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
