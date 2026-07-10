export interface Habit {
  id?: number
  name: string
  color: string
  createdAt: string
  archived: 0 | 1
}

export interface HabitEntry {
  id?: number
  habitId: number
  date: string
}

export interface HabitStatus {
  habit: Habit
  doneToday: boolean
  streak: number
}
