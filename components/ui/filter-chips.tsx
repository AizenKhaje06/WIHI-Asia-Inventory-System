import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface FilterChip {
  label: string
  value: string
  onRemove: () => void
}

interface FilterChipsProps {
  filters: FilterChip[]
  onClearAll?: () => void
}

export function FilterChips({ filters, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[5px] border border-slate-200 dark:border-slate-700">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        Active Filters:
      </span>
      {filters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="gap-2 pl-3 pr-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="text-xs">
            <span className="font-semibold">{filter.label}:</span> {filter.value}
          </span>
          <button
            onClick={filter.onRemove}
            className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
