"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, subMonths, startOfQuarter, 
  endOfQuarter, subQuarters, format 
} from "date-fns"

interface EnterpriseDateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onDateChange?: (start: Date | null, end: Date | null) => void
  className?: string
}

type PresetValue = 'today' | 'yesterday' | 'last7' | 'last14' | 'last28' | 'last30' | 
                   'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 
                   'thisQuarter' | 'lastQuarter' | 'custom'

interface DatePreset {
  value: PresetValue
  label: string
  getRange: () => { from: Date; to: Date }
}

export function EnterpriseDateRangePicker({ 
  startDate, 
  endDate, 
  onDateChange,
  className 
}: EnterpriseDateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetValue>('today')
  const [tempStart, setTempStart] = useState<Date | null>(startDate || null)
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate || null)
  const [selectingStart, setSelectingStart] = useState(true)
  const [currentMonth1, setCurrentMonth1] = useState(new Date())
  const [currentMonth2, setCurrentMonth2] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1)
  )
  const [compareEnabled, setCompareEnabled] = useState(false)

  const presets: DatePreset[] = [
    {
      value: 'today',
      label: 'Today',
      getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) })
    },
    {
      value: 'yesterday',
      label: 'Yesterday',
      getRange: () => ({ 
        from: startOfDay(subDays(new Date(), 1)), 
        to: endOfDay(subDays(new Date(), 1)) 
      })
    },
    {
      value: 'last7',
      label: 'Last 7 days',
      getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) })
    },
    {
      value: 'last14',
      label: 'Last 14 days',
      getRange: () => ({ from: startOfDay(subDays(new Date(), 13)), to: endOfDay(new Date()) })
    },
    {
      value: 'last28',
      label: 'Last 28 days',
      getRange: () => ({ from: startOfDay(subDays(new Date(), 27)), to: endOfDay(new Date()) })
    },
    {
      value: 'last30',
      label: 'Last 30 days',
      getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) })
    },
    {
      value: 'thisWeek',
      label: 'This week',
      getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) })
    },
    {
      value: 'lastWeek',
      label: 'Last week',
      getRange: () => {
        const lastWeek = subDays(new Date(), 7)
        return { 
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
          to: endOfWeek(lastWeek, { weekStartsOn: 1 }) 
        }
      }
    },
    {
      value: 'thisMonth',
      label: 'This month',
      getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    },
    {
      value: 'lastMonth',
      label: 'Last month',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1)
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
      }
    },
    {
      value: 'thisQuarter',
      label: 'This quarter',
      getRange: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) })
    },
    {
      value: 'lastQuarter',
      label: 'Last quarter',
      getRange: () => {
        const lastQuarter = subQuarters(new Date(), 1)
        return { from: startOfQuarter(lastQuarter), to: endOfQuarter(lastQuarter) }
      }
    }
  ]

  useEffect(() => {
    setTempStart(startDate || null)
    setTempEnd(endDate || null)
  }, [startDate, endDate])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset.value)
    const range = preset.getRange()
    setTempStart(range.from)
    setTempEnd(range.to)
  }

  const handleDateClick = (day: number, monthDate: Date) => {
    const selectedDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day
    )

    if (selectingStart) {
      setTempStart(startOfDay(selectedDate))
      setTempEnd(null)
      setSelectingStart(false)
      setSelectedPreset('custom')
    } else {
      if (tempStart && selectedDate < tempStart) {
        setTempEnd(endOfDay(tempStart))
        setTempStart(startOfDay(selectedDate))
      } else {
        setTempEnd(endOfDay(selectedDate))
      }
      setSelectingStart(true)
      setSelectedPreset('custom')
    }
  }

  const isDateInRange = (day: number, monthDate: Date) => {
    if (!tempStart || !tempEnd) return false
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    return date >= tempStart && date <= tempEnd
  }

  const isStartDate = (day: number, monthDate: Date) => {
    if (!tempStart) return false
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    return date.toDateString() === tempStart.toDateString()
  }

  const isEndDate = (day: number, monthDate: Date) => {
    if (!tempEnd) return false
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    return date.toDateString() === tempEnd.toDateString()
  }

  const formatDateRange = () => {
    if (!tempStart && !tempEnd) return "Select date range"
    if (tempStart && !tempEnd) return `${format(tempStart, 'MMM d, yyyy')} - ...`
    if (tempStart && tempEnd) {
      return `${format(tempStart, 'MMM d, yyyy')} - ${format(tempEnd, 'MMM d, yyyy')}`
    }
    return "Select date range"
  }

  const handleUpdate = () => {
    if (onDateChange && tempStart && tempEnd) {
      onDateChange(tempStart, tempEnd)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setTempStart(startDate || null)
    setTempEnd(endDate || null)
    setOpen(false)
  }

  const handlePrevMonth = (calendar: 1 | 2) => {
    if (calendar === 1) {
      setCurrentMonth1(new Date(currentMonth1.getFullYear(), currentMonth1.getMonth() - 1))
      setCurrentMonth2(new Date(currentMonth2.getFullYear(), currentMonth2.getMonth() - 1))
    }
  }

  const handleNextMonth = (calendar: 1 | 2) => {
    if (calendar === 2) {
      setCurrentMonth1(new Date(currentMonth1.getFullYear(), currentMonth1.getMonth() + 1))
      setCurrentMonth2(new Date(currentMonth2.getFullYear(), currentMonth2.getMonth() + 1))
    }
  }

  const days1 = getDaysInMonth(currentMonth1)
  const days2 = getDaysInMonth(currentMonth2)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-9 px-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs",
            !tempStart && !tempEnd && "text-slate-500",
            className
          )}
        >
          <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-medium">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl max-h-[500px] overflow-auto" 
        align="start"
        sideOffset={4}
      >
        <div className="flex">
          {/* Left Sidebar - Presets */}
          <div className="w-36 border-r border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900/50">
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium transition-all duration-200",
                    "hover:bg-white dark:hover:bg-slate-800",
                    selectedPreset === preset.value
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    selectedPreset === preset.value
                      ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400"
                      : "border-slate-300 dark:border-slate-600"
                  )}>
                    {selectedPreset === preset.value && (
                      <div className="w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - Calendars */}
          <div className="p-3">
            {/* Dual Calendar */}
            <div className="flex gap-3 mb-3">
              {/* Calendar 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handlePrevMonth(1)}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {monthNames[currentMonth1.getMonth()]} {currentMonth1.getFullYear()}
                  </h3>
                  <div className="w-5" />
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[9px] font-semibold text-slate-500 dark:text-slate-400 w-7 py-0.5"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {days1.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="w-7 h-7" />
                    }

                    const inRange = isDateInRange(day, currentMonth1)
                    const isStart = isStartDate(day, currentMonth1)
                    const isEnd = isEndDate(day, currentMonth1)
                    const isSelected = isStart || isEnd

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day, currentMonth1)}
                        className={cn(
                          "w-7 h-7 text-[11px] font-medium rounded transition-all duration-150 flex items-center justify-center",
                          "hover:bg-slate-100 dark:hover:bg-slate-800",
                          inRange && !isSelected && "bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white",
                          isSelected && "bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-sm",
                          !inRange && !isSelected && "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Calendar 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-5" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {monthNames[currentMonth2.getMonth()]} {currentMonth2.getFullYear()}
                  </h3>
                  <button
                    onClick={() => handleNextMonth(2)}
                    className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[9px] font-semibold text-slate-500 dark:text-slate-400 w-7 py-0.5"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {days2.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="w-7 h-7" />
                    }

                    const inRange = isDateInRange(day, currentMonth2)
                    const isStart = isStartDate(day, currentMonth2)
                    const isEnd = isEndDate(day, currentMonth2)
                    const isSelected = isStart || isEnd

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day, currentMonth2)}
                        className={cn(
                          "w-7 h-7 text-[11px] font-medium rounded transition-all duration-150 flex items-center justify-center",
                          "hover:bg-slate-100 dark:hover:bg-slate-800",
                          inRange && !isSelected && "bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white",
                          isSelected && "bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-sm",
                          !inRange && !isSelected && "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 space-y-2.5">
              {/* Compare Checkbox */}
              <div className="flex items-center gap-1.5">
                <Checkbox 
                  id="compare" 
                  checked={compareEnabled}
                  onCheckedChange={(checked) => setCompareEnabled(checked as boolean)}
                  className="border-slate-300 dark:border-slate-600 h-3.5 w-3.5"
                />
                <label 
                  htmlFor="compare" 
                  className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Compare
                </label>
              </div>

              {/* Custom Dropdown and Date Inputs */}
              <div className="flex items-center gap-1.5">
                <Select defaultValue="custom">
                  <SelectTrigger className="w-[85px] h-7 border-slate-300 dark:border-slate-600 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  value={tempStart ? format(tempStart, 'MMM d, yyyy') : ''}
                  readOnly
                  className="w-28 h-7 border-slate-300 dark:border-slate-600 text-[11px] px-2"
                />
                
                <span className="text-slate-400 text-[11px]">-</span>
                
                <Input
                  type="text"
                  value={tempEnd ? format(tempEnd, 'MMM d, yyyy') : ''}
                  readOnly
                  className="w-28 h-7 border-slate-300 dark:border-slate-600 text-[11px] px-2"
                />
              </div>

              {/* Footer Note */}
              <p className="text-[9px] text-slate-500 dark:text-slate-400">
                Dates are shown in Berlin Time
              </p>

              {/* Action Buttons */}
              <div className="flex justify-end gap-1.5 pt-1">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-3 h-7 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-[11px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="px-3 h-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md text-[11px]"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
