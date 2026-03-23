"use client"

import { useMemo } from 'react'

interface GaugeChartProps {
  value: number
  max: number
  label: string
  color?: string
  size?: number
  showMinMax?: boolean
}

export function GaugeChart({ 
  value, 
  max, 
  label, 
  color = '#3b82f6',
  size = 240,
  showMinMax = true
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  // Calculate angle: 0% = 180° (left), 100% = 0° (right)
  // Gauge goes from left to right (180° to 0°)
  const needleAngle = 180 - (percentage / 100) * 180
  
  const getColor = useMemo(() => {
    if (percentage >= 80) return '#10b981' // Green
    if (percentage >= 50) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }, [percentage])
  
  const getStatusText = useMemo(() => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 50) return 'Good'
    if (percentage >= 30) return 'Fair'
    return 'Poor'
  }, [percentage])
  
  const getStatusColor = useMemo(() => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }, [percentage])

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: size, height: size * 0.6 }}>
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 blur-2xl opacity-20 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${getColor} 0%, transparent 70%)`,
            transform: 'translateY(20%)'
          }}
        />
        
        {/* SVG Gauge */}
        <svg
          width={size}
          height={size * 0.6}
          viewBox={`0 0 ${size} ${size * 0.6}`}
          className="overflow-visible relative z-10"
        >
          <defs>
            {/* Gradient for progress arc */}
            <linearGradient id={`gaugeGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={getColor} stopOpacity="1" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id={`gaugeShadow-${label}`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background track with subtle gradient */}
          <path
            d={`M ${size * 0.15} ${size * 0.5} A ${size * 0.35} ${size * 0.35} 0 0 1 ${size * 0.85} ${size * 0.5}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            className="text-slate-200/60 dark:text-slate-700/60"
          />
          
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = 180 - (tick / 100) * 180
            const innerRadius = size * 0.28
            const outerRadius = size * 0.32
            const x1 = size / 2 + Math.cos((tickAngle - 90) * Math.PI / 180) * innerRadius
            const y1 = size * 0.5 + Math.sin((tickAngle - 90) * Math.PI / 180) * innerRadius
            const x2 = size / 2 + Math.cos((tickAngle - 90) * Math.PI / 180) * outerRadius
            const y2 = size * 0.5 + Math.sin((tickAngle - 90) * Math.PI / 180) * outerRadius
            
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={tick % 50 === 0 ? 2 : 1}
                className="text-slate-400 dark:text-slate-600"
              />
            )
          })}
          
          {/* Progress arc with gradient */}
          <path
            d={`M ${size * 0.15} ${size * 0.5} A ${size * 0.35} ${size * 0.35} 0 0 1 ${size * 0.85} ${size * 0.5}`}
            fill="none"
            stroke={`url(#gaugeGradient-${label})`}
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * Math.PI * size * 0.35} ${Math.PI * size * 0.35}`}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 12px ${getColor}60)`
            }}
          />
          
          {/* Needle with shadow */}
          <g filter={`url(#gaugeShadow-${label})`}>
            <line
              x1={size / 2}
              y1={size * 0.5}
              x2={size / 2 + Math.cos((needleAngle - 90) * Math.PI / 180) * (size * 0.3)}
              y2={size * 0.5 + Math.sin((needleAngle - 90) * Math.PI / 180) * (size * 0.3)}
              stroke={getColor}
              strokeWidth={size * 0.015}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </g>
          
          {/* Center hub with gradient */}
          <circle
            cx={size / 2}
            cy={size * 0.5}
            r={size * 0.05}
            fill={getColor}
            className="transition-all duration-500"
            style={{
              filter: `drop-shadow(0 2px 4px ${getColor}60)`
            }}
          />
          <circle
            cx={size / 2}
            cy={size * 0.5}
            r={size * 0.025}
            fill="white"
            opacity="0.9"
          />
        </svg>
        
        {/* Value display - Centered and prominent */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="text-5xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
            {percentage.toFixed(1)}%
          </div>
          <div className={`text-xs font-semibold uppercase tracking-wider mt-1 ${getStatusColor}`}>
            {getStatusText}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            {label}
          </div>
        </div>
        
        {/* Min/Max labels */}
        {showMinMax && (
          <>
            <div className="absolute left-0 bottom-0 text-xs text-slate-500 dark:text-slate-500 font-medium">
              0%
            </div>
            <div className="absolute right-0 bottom-0 text-xs text-slate-500 dark:text-slate-500 font-medium">
              100%
            </div>
          </>
        )}
      </div>
      
      {/* Additional info bar */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor }} />
          <span className="font-medium">{value} / {max}</span>
        </div>
      </div>
    </div>
  )
}
