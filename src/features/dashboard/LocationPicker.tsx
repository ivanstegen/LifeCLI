import { useState } from 'react'
import { setSetting } from '../settings/api'
import { geocodeCity } from './weather'

interface LocationPickerProps {
  onSaved: () => void
}

export default function LocationPicker({ onSaved }: LocationPickerProps) {
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const saveCoords = async (lat: number, lon: number, cityName: string) => {
    await setSetting('weather.lat', String(lat))
    await setSetting('weather.lon', String(lon))
    await setSetting('weather.city', cityName)
    onSaved()
  }

  const handleSaveCity = async () => {
    if (!city.trim()) {
      setError('Въведи град.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const geo = await geocodeCity(city.trim())
      await saveCoords(geo.lat, geo.lon, geo.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при търсене на града.')
    } finally {
      setBusy(false)
    }
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокацията не е налична в този браузър.')
      return
    }
    setError('')
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await saveCoords(
            position.coords.latitude,
            position.coords.longitude,
            'Моето местоположение',
          )
        } finally {
          setBusy(false)
        }
      },
      () => {
        setError('Достъпът до местоположението е отказан. Въведи град ръчно.')
        setBusy(false)
      },
    )
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-400">
        Задай локация, за да виждаш времето.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="напр. София"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="button"
          onClick={handleSaveCity}
          disabled={busy}
          className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Запазване…' : 'Запази'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleGeolocation}
        disabled={busy}
        className="mt-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300 disabled:opacity-60"
      >
        📍 Използвай текущото местоположение
      </button>

      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
    </div>
  )
}
