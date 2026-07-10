import { useState } from 'react'
import Card from '../../components/Card'
import { addWatchItem } from './api'
import type { WatchType } from './types'

interface AddWatchItemProps {
  onAdded: () => void
}

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'

const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

export default function AddWatchItem({ onAdded }: AddWatchItemProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<WatchType>('movie')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) {
      setError('Въведи заглавие.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await addWatchItem(title.trim(), type)
      setTitle('')
      setType('movie')
      onAdded()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-100">Добави заглавие</h2>

      <div className="@container">
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass} htmlFor="watch-title">
              Заглавие
            </label>
            <input
              id="watch-title"
              type="text"
              placeholder="напр. Interstellar, The Bear"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <span className={labelClass}>Тип</span>
            <div className="flex min-w-0 gap-2">
              <button
                type="button"
                onClick={() => setType('movie')}
                className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === 'movie'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎬 Филм
              </button>
              <button
                type="button"
                onClick={() => setType('series')}
                className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === 'series'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📺 Сериал
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

      <div className="mt-5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Добавяне…' : 'Добави'}
        </button>
      </div>
    </Card>
  )
}
