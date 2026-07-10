import { useEffect, useMemo, useState } from 'react'
import { addDays, eachDayOfInterval, format, startOfWeek, subWeeks } from 'date-fns'
import Card from '../../components/Card'
import { getEntriesForHabit, getHabits } from './api'
import type { Habit } from './types'

interface HabitHeatmapProps {
  refreshKey: number
}

const WEEKS = 12
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

export default function HabitHeatmap({ refreshKey }: HabitHeatmapProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [doneDates, setDoneDates] = useState<Set<string>>(() => new Set())

  const { weeks, from, to, todayStr } = useMemo(() => {
    const now = new Date()
    const start = startOfWeek(subWeeks(now, WEEKS - 1), { weekStartsOn: 1 })
    const gridEnd = addDays(startOfWeek(now, { weekStartsOn: 1 }), 6)
    const days = eachDayOfInterval({ start, end: gridEnd })

    const grouped: string[][] = []
    for (let i = 0; i < days.length; i += 7) {
      grouped.push(days.slice(i, i + 7).map((day) => format(day, 'yyyy-MM-dd')))
    }

    return {
      weeks: grouped,
      from: format(start, 'yyyy-MM-dd'),
      to: format(gridEnd, 'yyyy-MM-dd'),
      todayStr: format(now, 'yyyy-MM-dd'),
    }
  }, [])

  useEffect(() => {
    getHabits().then((list) => {
      setHabits(list)
      setSelectedId((current) =>
        current != null && list.some((habit) => habit.id === current)
          ? current
          : (list[0]?.id ?? null),
      )
    })
  }, [refreshKey])

  useEffect(() => {
    if (selectedId == null) {
      setDoneDates(new Set())
      return
    }
    let active = true
    getEntriesForHabit(selectedId, from, to).then((entries) => {
      if (active) setDoneDates(new Set(entries.map((entry) => entry.date)))
    })
    return () => {
      active = false
    }
  }, [selectedId, refreshKey, from, to])

  const selectedHabit = habits.find((habit) => habit.id === selectedId) ?? null

  return (
    <Card className="h-full">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-slate-100">Карта на активността</h2>
        {habits.length > 0 && (
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          >
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="mb-5 text-xs text-slate-500">Последните 12 седмици</p>

      {selectedHabit == null ? (
        <p className="text-sm text-slate-500">
          Добави навик, за да видиш картата на активността.
        </p>
      ) : (
        <>
          <div className="flex gap-1.5">
            <div className="flex flex-col gap-1.5">
              {WEEKDAY_LABELS.map((label, index) => (
                <div
                  key={label}
                  className="flex flex-1 items-center text-[10px] leading-none text-slate-500"
                >
                  {index % 2 === 0 ? label : ''}
                </div>
              ))}
            </div>

            <div className="flex flex-1 gap-1.5">
              {weeks.map((week) => (
                <div key={week[0]} className="flex flex-1 flex-col gap-1.5">
                  {week.map((dateStr) => {
                    const isFuture = dateStr > todayStr
                    const done = doneDates.has(dateStr)
                    return (
                      <div
                        key={dateStr}
                        title={isFuture ? undefined : `${dateStr}${done ? ' — изпълнен' : ''}`}
                        style={
                          done
                            ? {
                                backgroundColor: selectedHabit.color,
                                boxShadow: `0 0 8px ${selectedHabit.color}55`,
                              }
                            : undefined
                        }
                        className={`aspect-square w-full rounded-[3px] ${
                          isFuture ? 'bg-transparent' : done ? '' : 'bg-white/[0.06]'
                        }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: selectedHabit.color }}
              />
              изпълнен
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-white/[0.06]" />
              пропуснат
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
