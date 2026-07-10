import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  value: number
  format?: (n: number) => string
  className?: string
  duration?: number
}

export default function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  className,
  duration = 0.9,
}: CountUpProps) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const fromRef = useRef(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      fromRef.current = value
      return
    }
    const controls = animate(fromRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    fromRef.current = value
    return () => controls.stop()
  }, [value, reduce, duration])

  return <span className={className}>{format(display)}</span>
}
