import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
}

export default function Card({ children, className = '', interactive = true }: CardProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [4, -4]), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-4, 4]), { stiffness: 150, damping: 18 })

  const spotX = useTransform(px, (v) => `${v * 100}%`)
  const spotY = useTransform(py, (v) => `${v * 100}%`)
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${spotX} ${spotY}, rgba(129,140,248,0.16), transparent 62%)`

  const enabled = interactive && !reduce

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.section
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={enabled ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      whileHover={enabled ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`group relative z-0 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.85)] backdrop-blur-xl hover:z-20 focus-within:z-20 ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {enabled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      )}
      {children}
    </motion.section>
  )
}
