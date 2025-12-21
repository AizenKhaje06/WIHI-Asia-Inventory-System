import { useEffect, useState } from 'react'

export function useCountUp(
  end: number,
  duration = 2000,
  start = 0,
  enabled = true
) {
  const [count, setCount] = useState(start)
  
  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }
    
    let startTime: number | null = null
    const startValue = start
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(easeOut * (end - startValue) + startValue)
      
      setCount(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, start, enabled])
  
  return count
}

