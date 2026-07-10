import type { MouseEvent } from 'react'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { StaggerGroup, StaggerItem } from '../../components/Stagger'
import DashboardBackground from './DashboardBackground'
import WeatherCard from './WeatherCard'
import FinanceSummaryCard from './FinanceSummaryCard'
import TodayHabitsCard from './TodayHabitsCard'
import ContinueWatchingCard from './ContinueWatchingCard'
import LongestStreakCard from './LongestStreakCard'

function todayLabel(): string {
  const label = format(new Date(), 'EEEE, d MMMM yyyy', { locale: bg })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function DashboardPage() {
  const reduce = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.4 })

  const bgX = useTransform(sx, [-1, 1], [16, -16])
  const bgY = useTransform(sy, [-1, 1], [12, -12])
  const cardsX = useTransform(sx, [-1, 1], [-5, 5])
  const cardsY = useTransform(sy, [-1, 1], [-4, 4])

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="relative" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <motion.div
        style={reduce ? undefined : { x: bgX, y: bgY }}
        className="pointer-events-none absolute -inset-6 -z-10 lg:-inset-10"
      >
        <DashboardBackground />
      </motion.div>

      <motion.div style={reduce ? undefined : { x: cardsX, y: cardsY }} className="space-y-8">
        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Табло за деня
          </h1>
          <p className="mt-1 text-sm text-slate-400">{todayLabel()}</p>
        </header>

        <StaggerGroup className="bento">
          <StaggerItem className="area-balance min-w-0">
            <FinanceSummaryCard />
          </StaggerItem>
          <StaggerItem className="area-weather min-w-0">
            <WeatherCard />
          </StaggerItem>
          <StaggerItem className="area-streak min-w-0">
            <LongestStreakCard />
          </StaggerItem>
          <StaggerItem className="area-habits min-w-0">
            <TodayHabitsCard />
          </StaggerItem>
          <StaggerItem className="area-watch min-w-0">
            <ContinueWatchingCard />
          </StaggerItem>
        </StaggerGroup>
      </motion.div>
    </div>
  )
}
