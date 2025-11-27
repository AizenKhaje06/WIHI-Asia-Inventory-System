"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const timezones = [
  { label: "Taipei", value: "Asia/Taipei" },
  { label: "Manila", value: "Asia/Manila" },
  { label: "UTC", value: "UTC" },
  { label: "New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
]

export function Clock() {
  const [now, setNow] = useState(new Date())
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Taipei")

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formattedTime = formatInTimeZone(now, selectedTimezone, "yyyy-MM-dd / hh:mm:ss a")

  return (
    <div className="flex items-center gap-2 text-sm text-foreground/80 lg:absolute lg:top-4 lg:right-4 lg:z-20">
      <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
        <SelectTrigger className="w-24 sm:w-32 h-8 text-xs sm:text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="hidden sm:inline">{formattedTime}</span>
      <span className="sm:hidden">{formatInTimeZone(now, selectedTimezone, "hh:mm a")}</span>
    </div>
  )
}
