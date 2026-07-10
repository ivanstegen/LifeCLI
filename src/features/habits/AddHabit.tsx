import { useState } from 'react'
import Card from '../../components/Card'
import { addHabit } from './api'

interface AddHabitProps {
  onAdded: () => void
}

const HABIT_COLORS = [
  '#818cf8',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#38bdf8',
  '#c084fc',
  '#f472b6',
  '#2dd4bf',
]

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'

const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

export default function AddHabit({ onAdded }: AddHabitProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Въведи име на навика.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await addHabit(name.trim(), color)
      setName('')
      setColor(HABIT_COLORS[0])
      onAdded()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-100">Нов навик</h2>

      <div className="@container">
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass} htmlFor="habit-name">
              Име
            </label>
            <input
              id="habit-name"
              type="text"
              placeholder="напр. Спорт, Четене, Вода"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <span className={labelClass}>Цвят</span>
            <div className="flex flex-wrap gap-2 py-1">
              {HABIT_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Избери цвят ${option}`}
                  onClick={() => setColor(option)}
                  style={{ backgroundColor: option }}
                  className={`h-7 w-7 rounded-full transition ${
                    color === option
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : 'ring-1 ring-slate-700'
                  }`}
                />
              ))}
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
