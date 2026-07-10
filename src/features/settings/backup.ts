import { format } from 'date-fns'
import { db } from '../../db/database'
import type { Transaction } from '../finance/types'
import type { Habit, HabitEntry } from '../habits/types'
import type { WatchItem } from '../watch/types'
import type { Setting } from './types'

export const BACKUP_FORMAT = 1
export const DB_VERSION = 4

export interface BackupFile {
  format: number
  dbVersion: number
  exportedAt: string
  data: {
    transactions: Transaction[]
    habits: Habit[]
    habitEntries: HabitEntry[]
    watchItems: WatchItem[]
    settings: Setting[]
  }
}

export interface RecordCounts {
  transactions: number
  habits: number
  habitEntries: number
  watchItems: number
  settings: number
}

export async function exportData(): Promise<BackupFile> {
  const [transactions, habits, habitEntries, watchItems, settings] = await Promise.all([
    db.transactions.toArray(),
    db.habits.toArray(),
    db.habitEntries.toArray(),
    db.watchItems.toArray(),
    db.settings.toArray(),
  ])

  return {
    format: BACKUP_FORMAT,
    dbVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data: { transactions, habits, habitEntries, watchItems, settings },
  }
}

export async function downloadBackup(): Promise<void> {
  const backup = await exportData()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `lifecli-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

const DATA_KEYS: (keyof BackupFile['data'])[] = [
  'transactions',
  'habits',
  'habitEntries',
  'watchItems',
  'settings',
]

export function parseBackup(text: string): BackupFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Файлът не е валиден JSON.')
  }

  const candidate = parsed as Partial<BackupFile> | null
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Копието е повредено: неочакван формат.')
  }
  if (candidate.format !== BACKUP_FORMAT) {
    throw new Error(`Непознат формат на копието (очаква се ${BACKUP_FORMAT}).`)
  }

  const data = candidate.data as Partial<BackupFile['data']> | undefined
  if (!data || DATA_KEYS.some((key) => !Array.isArray(data[key]))) {
    throw new Error('Копието е повредено: липсват данни за някоя от таблиците.')
  }

  return candidate as BackupFile
}

export async function importData(backup: BackupFile): Promise<void> {
  await db.transaction(
    'rw',
    db.transactions,
    db.habits,
    db.habitEntries,
    db.watchItems,
    db.settings,
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.habits.clear(),
        db.habitEntries.clear(),
        db.watchItems.clear(),
        db.settings.clear(),
      ])
      await Promise.all([
        db.transactions.bulkAdd(backup.data.transactions),
        db.habits.bulkAdd(backup.data.habits),
        db.habitEntries.bulkAdd(backup.data.habitEntries),
        db.watchItems.bulkAdd(backup.data.watchItems),
        db.settings.bulkAdd(backup.data.settings),
      ])
    },
  )
}

export async function getRecordCounts(): Promise<RecordCounts> {
  const [transactions, habits, habitEntries, watchItems, settings] = await Promise.all([
    db.transactions.count(),
    db.habits.count(),
    db.habitEntries.count(),
    db.watchItems.count(),
    db.settings.count(),
  ])
  return { transactions, habits, habitEntries, watchItems, settings }
}
