import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Card from '../../components/Card'
import { StaggerGroup, StaggerItem } from '../../components/Stagger'
import {
  calcStreak,
  getEntriesForHabit,
  getHabits,
  toggleEntry,
} from '../habits/api'
import type { HabitStatus } from '../habits/types'

const today = () => format(new Date(), 'yyyy-MM-dd')

export default function TodayHabitsCard() {
  const [rows, setRows] = useState<HabitStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    const load = async () => {
      const habits = await getHabits()
      const day = today()
      const statuses = await Promise.all(
        habits.map(async (habit) => {
          const todays = await getEntriesForHabit(habit.id!, day, day)
          const streak = await calcStreak(habit.id!)
          return { habit, doneToday: todays.length > 0, streak }
        }),
      )
      if (active) {
        setRows(statuses)
        setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const handleToggle = async (habitId: number) => {
    const done = await toggleEntry(habitId, today())
    const streak = await calcStreak(habitId)
    setRows((prev) =>
      prev.map((row) =>
        row.habit.id === habitId ? { ...row, doneToday: done, streak } : row,
      ),
    )
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-200">Днешни навици</h2>
        <Link
          to="/habits"
          className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
        >
          Всички навици →
        </Link>
      </div>

      <div className="mt-3 flex-1">
        {loading ? (
          <p className="text-sm text-slate-500">Зареждане…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">Няма активни навици.</p>
        ) : (
          <StaggerGroup className="divide-y divide-white/5">
            {rows.map(({ habit, doneToday, streak }) => (
              <StaggerItem key={habit.id}>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}66` }}
                    />
                    <span className="truncate text-sm font-medium text-slate-200">
                      {habit.name}
                    </span>
                    {streak > 0 && (
                      <span className="shrink-0 text-xs text-slate-500">🔥 {streak}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(habit.id!)}
                    aria-label={doneToday ? 'Премахни отметката' : 'Отбележи днес'}
                    style={
                      doneToday
                        ? { backgroundColor: habit.color, borderColor: habit.color }
                        : undefined
                    }
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition active:scale-90 ${
                      doneToday
                        ? 'text-slate-950'
                        : 'border-white/15 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    ✓
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </Card>
  )
}
