import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import { StaggerGroup, StaggerItem } from '../../components/Stagger'
import { getWatchItems } from '../watch/api'
import type { WatchItem } from '../watch/types'

const TYPE_ICON: Record<WatchItem['type'], string> = {
  movie: '🎬',
  series: '📺',
}

export default function ContinueWatchingCard() {
  const [items, setItems] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getWatchItems('watching').then((rows) => {
      if (active) {
        setItems(rows)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-200">Продължавам да гледам</h2>
        <Link
          to="/watch"
          className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
        >
          Дъската →
        </Link>
      </div>

      <div className="mt-3 flex-1">
        {loading ? (
          <p className="text-sm text-slate-500">Зареждане…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Нищо в момента.</p>
        ) : (
          <StaggerGroup className="flex flex-wrap gap-2">
            {items.map((item) => (
              <StaggerItem
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.04] px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-200">
                  <span className="mr-1">{TYPE_ICON[item.type]}</span>
                  {item.title}
                </span>
                {item.type === 'series' && item.progress && (
                  <span className="text-xs text-slate-500">· {item.progress}</span>
                )}
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </Card>
  )
}
