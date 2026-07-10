import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Card from '../../components/Card'
import { StaggerGroup, StaggerItem } from '../../components/Stagger'
import {
  archiveHabit,
  calcStreak,
  getEntriesForHabit,
  getHabits,
  toggleEntry,
} from './api'
import type { HabitStatus } from './types'

interface HabitListProps {
  refreshKey: number
  onChanged: () => void
}

const today = () => format(new Date(), 'yyyy-MM-dd')

function pluralDays(count: number): string {
  return count === 1 ? 'ден' : 'дни'
}

export default function HabitList({ refreshKey, onChanged }: HabitListProps) {
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
  }, [refreshKey])

  const handleToggle = async (habitId: number) => {
    const done = await toggleEntry(habitId, today())
    const streak = await calcStreak(habitId)
    setRows((prev) =>
      prev.map((row) =>
        row.habit.id === habitId ? { ...row, doneToday: done, streak } : row,
      ),
    )
    onChanged()
  }

  const handleArchive = async (habitId: number) => {
    await archiveHabit(habitId)
    setRows((prev) => prev.filter((row) => row.habit.id !== habitId))
    onChanged()
  }

  return (
    <Card className="h-full">
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-100">Активни навици</h2>

      {loading ? (
        <p className="text-sm text-slate-500">Зареждане…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          Все още няма навици. Добави първия си навик отгоре.
        </p>
      ) : (
        <StaggerGroup className="divide-y divide-white/5">
          {rows.map(({ habit, doneToday, streak }) => (
            <StaggerItem key={habit.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}66` }}
                  />
                  <span className="font-medium text-slate-200">{habit.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="min-w-[92px] text-right text-sm">
                    {streak > 0 ? (
                      <span className="font-semibold text-slate-300">
                        🔥 {streak} {pluralDays(streak)}
                      </span>
                    ) : (
                      <span className="text-slate-500">Няма серия</span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggle(habit.id!)}
                    style={
                      doneToday
                        ? { backgroundColor: habit.color, borderColor: habit.color }
                        : undefined
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                      doneToday
                        ? 'text-slate-950'
                        : 'border-white/15 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {doneToday ? '✓ Отметнато днес' : 'Отбележи днес'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleArchive(habit.id!)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                  >
                    Архивирай
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Card>
  )
}
