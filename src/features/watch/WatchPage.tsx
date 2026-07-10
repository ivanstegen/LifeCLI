import { useState } from 'react'
import AddWatchItem from './AddWatchItem'
import WatchBoard from './WatchBoard'

export default function WatchPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey((key) => key + 1)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Гледане</h1>
        <p className="mt-1 text-sm text-slate-400">
          Организирай филмите и сериалите си в три колони: за гледане, гледам, изгледано.
        </p>
      </header>

      <AddWatchItem onAdded={bump} />
      <WatchBoard refreshKey={refreshKey} onChanged={bump} />
    </div>
  )
}
