"use client"

import { Shield, Lock, CheckCircle2 } from "lucide-react"

export function SecurityIndicator() {
  return (
    <div className="space-y-3">
      {/* SSL Encryption Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" />
        <span>Secured by 256-bit SSL encryption</span>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-500" />
          <span>Enterprise Security</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>SOC 2 Compliant</span>
        </div>
      </div>
    </div>
  )
}
