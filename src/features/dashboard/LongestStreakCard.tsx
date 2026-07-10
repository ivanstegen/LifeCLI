import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import CountUp from '../../components/CountUp'
import { calcStreak, getHabits } from '../habits/api'

export default function LongestStreakCard() {
  const [longest, setLongest] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const habits = await getHabits()
      const streaks = await Promise.all(habits.map((h) => calcStreak(h.id!)))
      if (active) setLongest(streaks.length ? Math.max(...streaks) : 0)
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <Card className="h-full">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-300">Най-дълъг streak</h2>
          <span aria-hidden className="text-xl">🔥</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          {longest == null ? (
            <span className="text-3xl font-bold text-slate-600">—</span>
          ) : (
            <CountUp
              value={longest}
              className="text-gradient font-display text-5xl font-bold tabular-nums"
            />
          )}
          <span className="text-sm text-slate-400">дни</span>
        </div>
      </div>
    </Card>
  )
}
