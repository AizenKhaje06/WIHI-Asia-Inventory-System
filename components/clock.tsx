"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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

  const formattedTime = format(now, "yyyy-MM-dd / hh:mm:ss a", {
    timeZone: selectedTimezone,
  })

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 text-sm text-foreground/80">
      <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
        <SelectTrigger className="w-32 h-8">
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
      <span>{formattedTime}</span>
    </div>
  )
}
