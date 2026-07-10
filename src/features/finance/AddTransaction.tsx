import { useState } from 'react'
import { format } from 'date-fns'
import Card from '../../components/Card'
import { addTransaction } from './api'
import type { TransactionType } from './types'

interface AddTransactionProps {
  onAdded: () => void
}

const today = () => format(new Date(), 'yyyy-MM-dd')

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'

const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

export default function AddTransaction({ onAdded }: AddTransactionProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setAmount('')
    setType('expense')
    setCategory('')
    setNote('')
    setDate(today())
  }

  const handleAdd = async () => {
    const parsed = Number(amount.replace(',', '.'))
    if (!amount.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError('Въведи валидна сума, по-голяма от 0.')
      return
    }
    if (!category.trim()) {
      setError('Въведи категория.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await addTransaction({
        amount: parsed,
        type,
        category: category.trim(),
        note: note.trim() || undefined,
        date,
      })
      resetForm()
      onAdded()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-slate-100">Нова транзакция</h2>

      <div className="@container">
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
          <div className="min-w-0">
            <label className={labelClass} htmlFor="tx-amount">
              Сума (€)
            </label>
            <input
              id="tx-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <span className={labelClass}>Тип</span>
            <div className="flex min-w-0 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === 'income'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Приход
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  type === 'expense'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Разход
              </button>
            </div>
          </div>

          <div className="min-w-0">
            <label className={labelClass} htmlFor="tx-category">
              Категория
            </label>
            <input
              id="tx-category"
              type="text"
              placeholder="напр. Храна, Заплата"
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="min-w-0 @sm:col-span-2">
            <label className={labelClass} htmlFor="tx-note">
              Бележка (по избор)
            </label>
            <input
              id="tx-note"
              type="text"
              placeholder="Кратко описание"
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className={labelClass} htmlFor="tx-date">
              Дата
            </label>
            <input
              id="tx-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
