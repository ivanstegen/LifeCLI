import { useState } from 'react'
import AddTransaction from './AddTransaction'
import MonthlyReport from './MonthlyReport'

export default function FinancePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          Финанси
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Записвай приходи и разходи и следи месечния си баланс.
        </p>
      </header>

      <div className="isolate grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 lg:sticky lg:top-8 lg:col-span-1 lg:self-start">
          <AddTransaction onAdded={() => setRefreshKey((key) => key + 1)} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <MonthlyReport refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
