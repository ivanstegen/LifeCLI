import { useState } from 'react'
import AddHabit from './AddHabit'
import HabitList from './HabitList'
import HabitHeatmap from './HabitHeatmap'

export default function HabitsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((key) => key + 1)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          Навици
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Изгради навици, отмятай ги всеки ден и следи сериите си.
        </p>
      </header>

      <AddHabit onAdded={bump} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HabitList refreshKey={refreshKey} onChanged={bump} />
        <HabitHeatmap refreshKey={refreshKey} />
      </div>
    </div>
  )
}
