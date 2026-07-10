import { db } from '../../db/database'
import type { WatchItem, WatchStatus, WatchType } from './types'

export async function addWatchItem(title: string, type: WatchType): Promise<number> {
  const item: WatchItem = {
    title,
    type,
    status: 'to_watch',
    createdAt: new Date().toISOString(),
  }
  return db.watchItems.add(item)
}

export async function getWatchItems(status?: WatchStatus): Promise<WatchItem[]> {
  if (status) {
    return db.watchItems.where('status').equals(status).toArray()
  }
  return db.watchItems.toArray()
}

export async function setStatus(id: number, status: WatchStatus): Promise<void> {
  const changes: Partial<WatchItem> = { status }
  if (status === 'watched') {
    changes.watchedAt = new Date().toISOString()
  } else {
    changes.watchedAt = undefined
  }
  await db.watchItems.update(id, changes)
}

export async function setRating(id: number, rating: number): Promise<void> {
  await db.watchItems.update(id, { rating })
}

export async function updateProgress(id: number, progress: string): Promise<void> {
  await db.watchItems.update(id, { progress })
}

export async function updateNote(id: number, note: string): Promise<void> {
  await db.watchItems.update(id, { note })
}

export async function deleteWatchItem(id: number): Promise<void> {
  await db.watchItems.delete(id)
}
