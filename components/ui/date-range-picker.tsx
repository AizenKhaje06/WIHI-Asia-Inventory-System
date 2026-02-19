"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onDateChange?: (start: Date | null, end: Date | null) => void
  className?: string
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onDateChange,
  className 
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStart, setTempStart] = useState<Date | null>(startDate || null)
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate || null)

  // Sync internal state with props
  useEffect(() => {
    setTempStart(startDate || null)
    setTempEnd(endDate || null)
  }, [startDate, endDate])

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    let firstDayOfWeek = firstDay.getDay()
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days: (number | null)[] = []
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )

    if (selectingStart) {
      setTempStart(selectedDate)
      setTempEnd(null)
      setSelectingStart(false)
    } else {
      if (tempStart && selectedDate < tempStart) {
        setTempEnd(tempStart)
        setTempStart(selectedDate)
      } else {
        setTempEnd(selectedDate)
      }
      setSelectingStart(true)
      
      if (onDateChange) {
        const finalStart = tempStart && selectedDate < tempStart ? selectedDate : tempStart
        const finalEnd = tempStart && selectedDate < tempStart ? tempStart : selectedDate
        onDateChange(finalStart, finalEnd)
      }
    }
  }

  const isDateInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date >= tempStart && date <= tempEnd
  }

  const isStartDate = (day: number) => {
    if (!tempStart) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toDateString() === tempStart.toDateString()
  }

  const isEndDate = (day: number) => {
    if (!tempEnd) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toDateString() === tempEnd.toDateString()
  }

  const formatDateRange = () => {
    if (!tempStart && !tempEnd) return "Select date range"
    if (tempStart && !tempEnd) return `${tempStart.toLocaleDateString()} - ...`
    if (tempStart && tempEnd) {
      return `${tempStart.toLocaleDateString()} - ${tempEnd.toLocaleDateString()}`
    }
    return "Select date range"
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !tempStart && !tempEnd && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Compact Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Compact Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />
              }

              const inRange = isDateInRange(day)
              const isStart = isStartDate(day)
              const isEnd = isEndDate(day)
              const isSelected = isStart || isEnd

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "relative h-9 text-sm font-medium rounded-lg transition-all duration-200",
                    "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105",
                    inRange && !isSelected && "bg-blue-100 dark:bg-blue-900/30 text-slate-900 dark:text-white",
                    isSelected && "bg-blue-500 text-white font-semibold shadow-md scale-105",
                    !inRange && !isSelected && "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {day}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 dark:ring-blue-500 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Compact Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {selectingStart ? "Select start date" : "Select end date"}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
