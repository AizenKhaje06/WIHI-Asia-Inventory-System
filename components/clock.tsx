"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

export function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute top-4 right-4 z-20 text-sm text-foreground/80">
      {format(now, "yyyy-MM-dd / hh:mm:ss a")}
    </div>
  )
}
