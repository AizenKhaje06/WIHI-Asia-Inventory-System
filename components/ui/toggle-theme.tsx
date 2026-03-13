"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AnimationType = 
  | "circle-spread" 
  | "flip-x-in" 
  | "flip-y-in" 
  | "fade" 
  | "slide-up" 
  | "slide-down"
  | "scale"
  | "rotate"

interface ToggleThemeProps {
  duration?: number
  animationType?: AnimationType
  className?: string
}

export function ToggleTheme({ 
  duration = 400, 
  animationType = "circle-spread",
  className 
}: ToggleThemeProps) {
  const { setTheme, theme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)

  const getAnimationClass = () => {
    switch (animationType) {
      case "flip-x-in":
        return "animate-flip-x"
      case "flip-y-in":
        return "animate-flip-y"
      case "fade":
        return "animate-fade"
      case "slide-up":
        return "animate-slide-up"
      case "slide-down":
        return "animate-slide-down"
      case "scale":
        return "animate-scale"
      case "rotate":
        return "animate-rotate"
      case "circle-spread":
      default:
        return "animate-circle-spread"
    }
  }

  const handleToggle = () => {
    setIsAnimating(true)
    setTheme(theme === "light" ? "dark" : "light")
    
    setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "relative overflow-hidden",
        isAnimating && getAnimationClass(),
        className
      )}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
