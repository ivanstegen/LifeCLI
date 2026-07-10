import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { getSetting } from '../settings/api'
import LocationPicker from './LocationPicker'
import { getWeather, weatherCodeToText } from './weather'
import type { WeatherData } from './weather'

interface Location {
  lat: number
  lon: number
  city: string
}

type LoadState = 'loading' | 'ready' | 'error'

export default function WeatherCard() {
  const [location, setLocation] = useState<Location | null>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [editing, setEditing] = useState(false)
  const [locRefresh, setLocRefresh] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([
      getSetting('weather.lat'),
      getSetting('weather.lon'),
      getSetting('weather.city'),
    ]).then(([lat, lon, city]) => {
      if (!active) return
      if (lat && lon) {
        setLocation({ lat: Number(lat), lon: Number(lon), city: city ?? '' })
      } else {
        setLocation(null)
      }
      setSettingsLoaded(true)
    })
    return () => {
      active = false
    }
  }, [locRefresh])

  useEffect(() => {
    if (!location) return
    let active = true
    setState('loading')
    getWeather(location.lat, location.lon)
      .then((data) => {
        if (!active) return
        setWeather(data)
        setState('ready')
      })
      .catch((err) => {
        if (!active) return
        setErrorMsg(err instanceof Error ? err.message : 'Неуспешно зареждане.')
        setState('error')
      })
    return () => {
      active = false
    }
  }, [location])

  const handleSaved = () => {
    setEditing(false)
    setLocRefresh((key) => key + 1)
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-slate-200">Времето</h2>
        {location && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Смени локация
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-center">
        {!settingsLoaded ? (
          <p className="text-sm text-slate-500">Зареждане…</p>
        ) : !location || editing ? (
          <LocationPicker onSaved={handleSaved} />
        ) : state === 'loading' ? (
          <p className="text-sm text-slate-500">Зареждане на времето…</p>
        ) : state === 'error' ? (
          <div>
            <p className="text-sm text-rose-400">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setLocRefresh((key) => key + 1)}
              className="mt-2 text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              Опитай пак
            </button>
          </div>
        ) : weather ? (
          <WeatherView city={location.city} weather={weather} />
        ) : null}
      </div>
    </Card>
  )
}

function WeatherView({ city, weather }: { city: string; weather: WeatherData }) {
  const description = weatherCodeToText(weather.code)
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-400">{city || 'Локация'}</p>
        <p className="font-display mt-1 text-5xl font-bold tabular-nums text-slate-100">
          {Math.round(weather.temperature)}°
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {description.text} · макс {Math.round(weather.max)}° / мин{' '}
          {Math.round(weather.min)}°
        </p>
      </div>
      <div className="text-6xl leading-none drop-shadow-[0_0_20px_rgba(129,140,248,0.35)]" aria-hidden>
        {description.emoji}
      </div>
    </div>
  )
}
