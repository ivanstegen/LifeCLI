import { useState } from 'react'
import {
  deleteWatchItem,
  setRating,
  setStatus,
  updateNote,
  updateProgress,
} from './api'
import type { WatchItem } from './types'

interface WatchCardProps {
  item: WatchItem
  onChanged: () => void
}

const TYPE_ICON: Record<WatchItem['type'], string> = {
  movie: '🎬',
  series: '📺',
}

const TYPE_LABEL: Record<WatchItem['type'], string> = {
  movie: 'Филм',
  series: 'Сериал',
}

const primaryBtn =
  'rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500'
const secondaryBtn =
  'rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700'

export default function WatchCard({ item, onChanged }: WatchCardProps) {
  const id = item.id!
  const [progress, setProgress] = useState(item.progress ?? '')
  const [note, setNote] = useState(item.note ?? '')

  const changeStatus = async (status: WatchItem['status']) => {
    await setStatus(id, status)
    onChanged()
  }

  const handleRating = async (value: number) => {
    await setRating(id, value)
    onChanged()
  }

  const handleProgress = (value: string) => {
    setProgress(value)
    void updateProgress(id, value)
  }

  const handleNote = (value: string) => {
    setNote(value)
    void updateNote(id, value)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Изтриване на „${item.title}"?`)) return
    await deleteWatchItem(id)
    onChanged()
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 shadow-sm shadow-black/20 transition hover:border-white/20 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-100">
            <span className="mr-1">{TYPE_ICON[item.type]}</span>
            {item.title}
          </p>
          <span className="text-xs text-slate-500">{TYPE_LABEL[item.type]}</span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Изтрий"
          className="shrink-0 rounded-md px-1.5 py-0.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
        >
          ✕
        </button>
      </div>

      {item.type === 'series' && item.status === 'watching' && (
        <input
          type="text"
          value={progress}
          onChange={(e) => handleProgress(e.target.value)}
          placeholder="напр. Сезон 2, епизод 5"
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30"
        />
      )}

      {item.status === 'watched' && (
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              aria-label={`Оценка ${star}`}
              className={`text-lg leading-none transition ${
                (item.rating ?? 0) >= star ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.status === 'to_watch' && (
          <button type="button" className={primaryBtn} onClick={() => changeStatus('watching')}>
            ▶ Гледам
          </button>
        )}

        {item.status === 'watching' && (
          <>
            <button type="button" className={primaryBtn} onClick={() => changeStatus('watched')}>
              ✓ Изгледано
            </button>
            <button type="button" className={secondaryBtn} onClick={() => changeStatus('to_watch')}>
              ↩ За гледане
            </button>
          </>
        )}

        {item.status === 'watched' && (
          <button type="button" className={secondaryBtn} onClick={() => changeStatus('watching')}>
            ↩ Гледам отново
          </button>
        )}
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => handleNote(e.target.value)}
        placeholder="Бележка…"
        className="mt-3 w-full rounded-md border border-transparent bg-slate-900 px-2 py-1 text-xs text-slate-300 placeholder:text-slate-500 outline-none focus:border-slate-600"
      />
    </div>
  )
}
