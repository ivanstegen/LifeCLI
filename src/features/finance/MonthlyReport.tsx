import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../../components/Card'
import CountUp from '../../components/CountUp'
import { formatMoney, getTransactionsForMonth, summarize } from './api'
import type { Transaction } from './types'

interface MonthlyReportProps {
  refreshKey: number
}

const currentMonth = () => format(new Date(), 'yyyy-MM')

export default function MonthlyReport({ refreshKey }: MonthlyReportProps) {
  const [month, setMonth] = useState(currentMonth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const [year, monthNumber] = month.split('-').map(Number)
    let active = true
    setLoading(true)

    getTransactionsForMonth(year, monthNumber).then((rows) => {
      if (!active) return
      setTransactions(rows)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [month, refreshKey])

  const summary = useMemo(() => summarize(transactions), [transactions])
  const balancePositive = summary.balance >= 0

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-slate-100">Месечен отчет</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value || currentMonth())}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Приходи" value={summary.income} tone="income" />
        <SummaryCard label="Разходи" value={summary.expense} tone="expense" />
        <SummaryCard
          label="Баланс"
          value={summary.balance}
          tone={balancePositive ? 'income' : 'expense'}
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Зареждане…</p>
      ) : summary.breakdown.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Няма разходи за избрания месец.
        </p>
      ) : (
        <>
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              Разходи по категории
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4 font-medium">Категория</th>
                    <th className="py-2 pr-4 text-right font-medium">Сума</th>
                    <th className="py-2 text-right font-medium">Дял</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.breakdown.map((row) => (
                    <tr key={row.category} className="border-b border-slate-800/60">
                      <td className="py-2 pr-4 text-slate-300">{row.category}</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-slate-100">
                        {formatMoney(row.total)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-slate-400">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              Графика на разходите
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.breakdown}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    formatter={(value) => formatMoney(Number(value))}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                    itemStyle={{ color: '#e2e8f0' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total" name="Разход" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

interface SummaryCardProps {
  label: string
  value: number
  tone: 'income' | 'expense'
}

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const valueColor = tone === 'income' ? 'text-emerald-400' : 'text-rose-400'
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <CountUp
        value={value}
        format={formatMoney}
        className={`font-display mt-1 block text-xl font-bold tabular-nums ${valueColor}`}
      />
    </div>
  )
}
