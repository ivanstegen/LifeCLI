export interface GeoResult {
  lat: number
  lon: number
  name: string
}

export interface WeatherData {
  temperature: number
  max: number
  min: number
  code: number
}

export interface WeatherDescription {
  text: string
  emoji: string
}

export async function geocodeCity(name: string): Promise<GeoResult> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(name)}&count=1&language=bg&format=json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Грешка при търсене на града.')
  }

  const data = await response.json()
  const first = data?.results?.[0]
  if (!first) {
    throw new Error('Градът не е намерен.')
  }

  return { lat: first.latitude, lon: first.longitude, name: first.name }
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code' +
    '&timezone=auto'

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Грешка при зареждане на времето.')
  }

  const data = await response.json()
  return {
    temperature: data.current.temperature_2m,
    code: data.current.weather_code,
    max: data.daily.temperature_2m_max[0],
    min: data.daily.temperature_2m_min[0],
  }
}

const WEATHER_CODES: Record<number, WeatherDescription> = {
  0: { text: 'Ясно', emoji: '☀️' },
  1: { text: 'Предимно ясно', emoji: '🌤️' },
  2: { text: 'Променлива облачност', emoji: '⛅' },
  3: { text: 'Облачно', emoji: '☁️' },
  45: { text: 'Мъгла', emoji: '🌫️' },
  48: { text: 'Заскрежена мъгла', emoji: '🌫️' },
  51: { text: 'Слаб ръмеж', emoji: '🌦️' },
  53: { text: 'Ръмеж', emoji: '🌦️' },
  55: { text: 'Силен ръмеж', emoji: '🌦️' },
  56: { text: 'Леден ръмеж', emoji: '🌧️' },
  57: { text: 'Силен леден ръмеж', emoji: '🌧️' },
  61: { text: 'Слаб дъжд', emoji: '🌦️' },
  63: { text: 'Дъжд', emoji: '🌧️' },
  65: { text: 'Силен дъжд', emoji: '🌧️' },
  66: { text: 'Леден дъжд', emoji: '🌧️' },
  67: { text: 'Силен леден дъжд', emoji: '🌧️' },
  71: { text: 'Слаб сняг', emoji: '🌨️' },
  73: { text: 'Сняг', emoji: '❄️' },
  75: { text: 'Силен сняг', emoji: '❄️' },
  77: { text: 'Снежни зърна', emoji: '❄️' },
  80: { text: 'Слаби превалявания', emoji: '🌦️' },
  81: { text: 'Превалявания', emoji: '🌧️' },
  82: { text: 'Силни превалявания', emoji: '⛈️' },
  85: { text: 'Снежни превалявания', emoji: '🌨️' },
  86: { text: 'Силни снежни превалявания', emoji: '🌨️' },
  95: { text: 'Гръмотевична буря', emoji: '⛈️' },
  96: { text: 'Буря с градушка', emoji: '⛈️' },
  99: { text: 'Силна буря с градушка', emoji: '⛈️' },
}

export function weatherCodeToText(code: number): WeatherDescription {
  return WEATHER_CODES[code] ?? { text: 'Неизвестно', emoji: '❓' }
}
