export type WatchType = 'movie' | 'series'

export type WatchStatus = 'to_watch' | 'watching' | 'watched'

export interface WatchItem {
  id?: number
  title: string
  type: WatchType
  status: WatchStatus
  rating?: number
  progress?: string
  note?: string
  createdAt: string
  watchedAt?: string
}
