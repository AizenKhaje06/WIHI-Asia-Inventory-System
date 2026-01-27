"use client"

import { useMemo } from 'react'

interface GaugeChartProps {
  value: number
  max: number
  label: string
  color?: string
  size?: number
}

export function GaugeChart({ 
  value, 
  max, 
  label, 
  color = '#3b82f6',
  size = 200 
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 180 // Half circle (180 degrees)
  
  const getColor = useMemo(() => {
    if (percentage >= 80) return '#10b981' // Green
    if (percentage >= 50) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }, [percentage])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 }}>
        {/* Background arc */}
        <svg
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d={`M ${size * 0.1} ${size / 2} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={size * 0.08}
            className="text-slate-200 dark:text-slate-800"
          />
          
          {/* Progress arc */}
          <path
            d={`M ${size * 0.1} ${size / 2} A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size / 2}`}
            fill="none"
            stroke={getColor}
            strokeWidth={size * 0.08}
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * Math.PI * size * 0.4} ${Math.PI * size * 0.4}`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor}40)`
            }}
          />
          
          {/* Needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + Math.cos((angle - 90) * Math.PI / 180) * (size * 0.35)}
            y2={size / 2 + Math.sin((angle - 90) * Math.PI / 180) * (size * 0.35)}
            stroke={getColor}
            strokeWidth={size * 0.02}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Center dot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.04}
            fill={getColor}
          />
        </svg>
        
        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {percentage.toFixed(0)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
