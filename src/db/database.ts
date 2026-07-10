import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Transaction } from '../features/finance/types'
import type { Habit, HabitEntry } from '../features/habits/types'
import type { WatchItem } from '../features/watch/types'
import type { Setting } from '../features/settings/types'

export class LifeDatabase extends Dexie {
  transactions!: Table<Transaction, number>
  habits!: Table<Habit, number>
  habitEntries!: Table<HabitEntry, number>
  watchItems!: Table<WatchItem, number>
  settings!: Table<Setting, string>

  constructor() {
    super('life')

    this.version(1).stores({
      transactions: '++id, type, category, date',
    })

    this.version(2).stores({
      habits: '++id, name, archived',
      habitEntries: '++id, habitId, date, [habitId+date]',
    })

    this.version(3).stores({
      watchItems: '++id, type, status, title',
    })

    this.version(4).stores({
      settings: 'key',
    })
  }
}

export const db = new LifeDatabase()
