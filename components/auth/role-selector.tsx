"use client"

import { Shield, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type UserRole = "admin" | "staff" | "packer"

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
  disabled?: boolean
}

const roles = [
  {
    id: "admin" as UserRole,
    label: "Admin",
    icon: Shield,
    description: "Full system management",
    color: "blue",
  },
  {
    id: "staff" as UserRole,
    label: "Staff",
    icon: Users,
    description: "Inventory operations",
    color: "emerald",
  },
  {
    id: "packer" as UserRole,
    label: "Packer",
    icon: Package,
    description: "Order fulfillment and packing",
    color: "purple",
  },
]

export function RoleSelector({ selectedRole, onRoleChange, disabled }: RoleSelectorProps) {
  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Role Tabs with Sliding Indicator */}
        <div className="relative flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl shadow-inner">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            
            return (
              <Tooltip key={role.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onRoleChange(role.id)}
                    disabled={disabled}
                    className={cn(
                      "relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:scale-[1.01]"
                    )}
                    aria-label={`Select ${role.label} role`}
                    aria-pressed={isSelected}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{role.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 border-slate-600">
                  <p className="font-semibold text-white">{role.label}</p>
                  <p className="text-xs text-slate-300">{role.description}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        
        {/* Dynamic Role Description */}
        <div className="text-center animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <p className="text-sm text-slate-400">
            {roles.find(r => r.id === selectedRole)?.description}
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}
