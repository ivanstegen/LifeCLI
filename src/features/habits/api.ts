import { format, subDays } from 'date-fns'
import { db } from '../../db/database'
import type { Habit, HabitEntry } from './types'

const toISODate = (date: Date) => format(date, 'yyyy-MM-dd')

export async function addHabit(name: string, color: string): Promise<number> {
  const habit: Habit = {
    name,
    color,
    createdAt: new Date().toISOString(),
    archived: 0,
  }
  return db.habits.add(habit)
}

export async function getHabits(): Promise<Habit[]> {
  return db.habits.where('archived').equals(0).sortBy('createdAt')
}

export async function archiveHabit(id: number): Promise<void> {
  await db.habits.update(id, { archived: 1 })
}

export async function toggleEntry(habitId: number, date: string): Promise<boolean> {
  const existing = await db.habitEntries
    .where('[habitId+date]')
    .equals([habitId, date])
    .first()

  if (existing?.id != null) {
    await db.habitEntries.delete(existing.id)
    return false
  }

  await db.habitEntries.add({ habitId, date })
  return true
}

export async function getEntriesForHabit(
  habitId: number,
  fromDate: string,
  toDate: string,
): Promise<HabitEntry[]> {
  return db.habitEntries
    .where('date')
    .between(fromDate, toDate, true, true)
    .filter((entry) => entry.habitId === habitId)
    .toArray()
}

export async function calcStreak(habitId: number): Promise<number> {
  const entries = await db.habitEntries.where('habitId').equals(habitId).toArray()
  const dates = new Set(entries.map((entry) => entry.date))

  const today = new Date()
  let cursor = today

  if (!dates.has(toISODate(today))) {
    cursor = subDays(today, 1)
    if (!dates.has(toISODate(cursor))) {
      return 0
    }
  }

  let streak = 0
  while (dates.has(toISODate(cursor))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }

  return streak
}
