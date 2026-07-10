import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import CountUp from '../../components/CountUp'
import {
  formatMoney,
  getTransactionsForMonth,
  summarize,
} from '../finance/api'
import type { MonthlySummary } from '../finance/types'

export default function FinanceSummaryCard() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)

  useEffect(() => {
    let active = true
    const now = new Date()
    getTransactionsForMonth(now.getFullYear(), now.getMonth() + 1)
      .then((txs) => {
        if (active) setSummary(summarize(txs))
      })
    return () => {
      active = false
    }
  }, [])

  const balancePositive = (summary?.balance ?? 0) >= 0

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-200">Баланс този месец</h2>
        <Link
          to="/finance"
          className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
        >
          Виж отчета →
        </Link>
      </div>

      {summary == null ? (
        <p className="mt-6 text-sm text-slate-500">Зареждане…</p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Текущ баланс
          </p>
          <CountUp
            value={summary.balance}
            format={formatMoney}
            className={`font-display mt-1 text-5xl font-bold tabular-nums sm:text-6xl ${
              balancePositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <span className="text-xs text-slate-400">Приходи</span>
              <CountUp
                value={summary.income}
                format={formatMoney}
                className="block font-semibold tabular-nums text-emerald-400"
              />
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <span className="text-xs text-slate-400">Разходи</span>
              <CountUp
                value={summary.expense}
                format={formatMoney}
                className="block font-semibold tabular-nums text-rose-400"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
