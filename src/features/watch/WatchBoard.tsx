import { useEffect, useState } from 'react'
import { StaggerGroup, StaggerItem } from '../../components/Stagger'
import { getWatchItems } from './api'
import WatchCard from './WatchCard'
import type { WatchItem, WatchStatus, WatchType } from './types'

interface WatchBoardProps {
  refreshKey: number
  onChanged: () => void
}

const GROUPS: { type: WatchType; label: string }[] = [
  { type: 'movie', label: '🎬 Филми' },
  { type: 'series', label: '📺 Сериали' },
]

const COLUMNS: { status: WatchStatus; label: string }[] = [
  { status: 'to_watch', label: 'За гледане' },
  { status: 'watching', label: 'Гледам' },
  { status: 'watched', label: 'Изгледано' },
]

const byCreatedDesc = (a: WatchItem, b: WatchItem) =>
  b.createdAt.localeCompare(a.createdAt)

const byWatchedDesc = (a: WatchItem, b: WatchItem) =>
  (b.watchedAt ?? '').localeCompare(a.watchedAt ?? '')

export default function WatchBoard({ refreshKey, onChanged }: WatchBoardProps) {
  const [items, setItems] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getWatchItems().then((rows) => {
      if (active) {
        setItems(rows)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [refreshKey])

  const columnItems = (type: WatchType, status: WatchStatus) => {
    const filtered = items.filter((item) => item.type === type && item.status === status)
    return filtered.sort(status === 'watched' ? byWatchedDesc : byCreatedDesc)
  }

  return (
    <div className="space-y-8">
      {GROUPS.map((group) => (
        <section key={group.type}>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {COLUMNS.map(({ status, label }) => {
              const cards = columnItems(group.type, status)
              return (
                <div
                  key={status}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">{label}</h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {cards.length}
                    </span>
                  </div>

                  {loading ? (
                    <p className="text-xs text-slate-500">Зареждане…</p>
                  ) : cards.length === 0 ? (
                    <p className="text-xs text-slate-500">Няма записи.</p>
                  ) : (
                    <StaggerGroup className="space-y-3">
                      {cards.map((item) => (
                        <StaggerItem key={item.id}>
                          <WatchCard item={item} onChanged={onChanged} />
                        </StaggerItem>
                      ))}
                    </StaggerGroup>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
