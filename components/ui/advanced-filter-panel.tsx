/**
 * Enterprise Advanced Filter Panel
 * Complex filtering with save/load capabilities
 */

"use client"

import * as React from "react"
import { X, Filter, Save, ChevronDown, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface FilterField {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'
  options?: { label: string; value: string }[]
  placeholder?: string
}

export interface FilterCondition {
  id: string
  fieldId: string
  operator: string
  value: any
}

export interface SavedFilter {
  id: string
  name: string
  conditions: FilterCondition[]
}

interface AdvancedFilterPanelProps {
  fields: FilterField[]
  onApplyFilters: (conditions: FilterCondition[]) => void
  savedFilters?: SavedFilter[]
  onSaveFilter?: (name: string, conditions: FilterCondition[]) => void
  onDeleteFilter?: (id: string) => void
  triggerButton?: React.ReactNode
}

const operatorsByType: Record<string, { label: string; value: string }[]> = {
  text: [
    { label: 'Contains', value: 'contains' },
    { label: 'Equals', value: 'equals' },
    { label: 'Starts with', value: 'startsWith' },
    { label: 'Ends with', value: 'endsWith' },
    { label: 'Does not contain', value: 'notContains' },
  ],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Less than', value: 'lt' },
    { label: 'Greater than or equal', value: 'gte' },
    { label: 'Less than or equal', value: 'lte' },
    { label: 'Between', value: 'between' },
  ],
  date: [
    { label: 'On', value: 'on' },
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Between', value: 'between' },
  ],
  select: [
    { label: 'Is', value: 'is' },
    { label: 'Is not', value: 'isNot' },
  ],
  boolean: [
    { label: 'Is', value: 'is' },
  ],
}

export function AdvancedFilterPanel({
  fields,
  onApplyFilters,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  triggerButton,
}: AdvancedFilterPanelProps) {
  const [open, setOpen] = React.useState(false)
  const [conditions, setConditions] = React.useState<FilterCondition[]>([])
  const [filterName, setFilterName] = React.useState('')
  const [showSaveForm, setShowSaveForm] = React.useState(false)

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      fieldId: fields[0]?.id || '',
      operator: 'contains',
      value: '',
    }
    setConditions([...conditions, newCondition])
  }

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(
      conditions.map((cond) => (cond.id === id ? { ...cond, ...updates } : cond))
    )
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((cond) => cond.id !== id))
  }

  const applyFilters = () => {
    onApplyFilters(conditions)
    setOpen(false)
  }

  const clearFilters = () => {
    setConditions([])
    onApplyFilters([])
  }

  const loadSavedFilter = (filter: SavedFilter) => {
    setConditions(filter.conditions)
    onApplyFilters(filter.conditions)
    setOpen(false)
  }

  const saveCurrentFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim(), conditions)
      setFilterName('')
      setShowSaveForm(false)
    }
  }

  const getFieldById = (id: string) => fields.find((f) => f.id === id)

  const activeFilterCount = conditions.filter((c) => c.value !== '' && c.value !== null).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Create complex filters to refine your search results
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Saved Filters</Label>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-1 rounded-[5px] border px-3 py-1.5 text-sm"
                  >
                    <button
                      onClick={() => loadSavedFilter(filter)}
                      className="hover:text-orange-600 transition-colors"
                    >
                      {filter.name}
                    </button>
                    {onDeleteFilter && (
                      <button
                        onClick={() => onDeleteFilter(filter.id)}
                        className="ml-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Filter Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Filter Conditions</Label>
              <Button onClick={addCondition} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {conditions.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-500">
                No conditions added yet. Click "Add Condition" to start.
              </div>
            )}

            {conditions.map((condition, index) => {
              const field = getFieldById(condition.fieldId)
              const operators = field ? operatorsByType[field.type] || [] : []

              return (
                <div
                  key={condition.id}
                  className="flex items-start gap-2 p-4 rounded-[5px] border bg-slate-50 dark:bg-slate-900"
                >
                  {/* Condition Number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold mt-2">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Field Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Field</Label>
                        <Select
                          value={condition.fieldId}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { fieldId: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { operator: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Value Input */}
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      {field?.type === 'select' ? (
                        <Select
                          value={condition.value}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(condition.id, { value: e.target.value })
                          }
                          placeholder={field?.placeholder || 'Enter value...'}
                          className="h-9"
                        />
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                    className="flex-shrink-0 mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Save Filter */}
          {onSaveFilter && conditions.length > 0 && (
            <div className="space-y-3">
              <Separator />
              {showSaveForm ? (
                <div className="space-y-2">
                  <Label className="text-sm">Save this filter</Label>
                  <div className="flex gap-2">
                    <Input
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="Filter name..."
                      className="h-9"
                    />
                    <Button onClick={saveCurrentFilter} size="sm" disabled={!filterName.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setShowSaveForm(false)}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSaveForm(true)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Filter
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={clearFilters} size="sm">
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
