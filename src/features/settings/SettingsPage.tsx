import { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import Card from '../../components/Card'
import { isReconverted, LEV_PER_EUR, reconvertLevToEuro } from '../finance/api'
import {
  downloadBackup,
  getRecordCounts,
  importData,
  parseBackup,
} from './backup'
import type { BackupFile, RecordCounts } from './backup'

const COUNT_LABELS: { key: keyof RecordCounts; label: string }[] = [
  { key: 'transactions', label: 'Транзакции' },
  { key: 'habits', label: 'Навици' },
  { key: 'habitEntries', label: 'Отметки на навици' },
  { key: 'watchItems', label: 'Заглавия за гледане' },
  { key: 'settings', label: 'Настройки' },
]

function countsOf(backup: BackupFile): RecordCounts {
  return {
    transactions: backup.data.transactions.length,
    habits: backup.data.habits.length,
    habitEntries: backup.data.habitEntries.length,
    watchItems: backup.data.watchItems.length,
    settings: backup.data.settings.length,
  }
}

function formatExportedAt(iso: string): string {
  try {
    return format(parseISO(iso), 'dd.MM.yyyy HH:mm')
  } catch {
    return iso
  }
}

export default function SettingsPage() {
  const [counts, setCounts] = useState<RecordCounts | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ backup: BackupFile; counts: RecordCounts } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [reconverted, setReconverted] = useState<boolean | null>(null)
  const [reconverting, setReconverting] = useState(false)
  const [reconvertMsg, setReconvertMsg] = useState('')

  useEffect(() => {
    getRecordCounts().then(setCounts)
    isReconverted().then(setReconverted)
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadBackup()
    } finally {
      setDownloading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setPending(null)
    setSelectedFile(event.target.files?.[0] ?? null)
  }

  const handleRestore = async () => {
    if (!selectedFile) {
      setError('Първо избери .json файл.')
      return
    }
    setError('')
    try {
      const text = await selectedFile.text()
      const backup = parseBackup(text)
      setPending({ backup, counts: countsOf(backup) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешно четене на файла.')
    }
  }

  const handleConfirmImport = async () => {
    if (!pending) return
    setImporting(true)
    try {
      await importData(pending.backup)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възстановяването се провали.')
      setImporting(false)
    }
  }

  const handleCancel = () => {
    setPending(null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReconvert = async () => {
    const confirmed = window.confirm(
      `Това ще раздели ВСИЧКИ суми на ${LEV_PER_EUR} и е ЕДНОКРАТНО и НЕОБРАТИМО.\n\n` +
        'Пусни го само ако старите суми са записани в ЛЕВОВЕ. Продължаваш?',
    )
    if (!confirmed) return

    setReconverting(true)
    try {
      const result = await reconvertLevToEuro()
      setReconverted(true)
      setReconvertMsg(
        result.alreadyDone
          ? 'Превалутирането вече е било извършено — нищо не е променено.'
          : `Готово: превалутирани ${result.converted} записа от левове в евро.`,
      )
      setCounts(await getRecordCounts())
    } finally {
      setReconverting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Настройки</h1>
        <p className="mt-1 text-sm text-slate-400">
          Управление на данните на LifeCLI.
        </p>
      </header>

      <Card>
        <h2 className="font-display text-lg font-semibold text-slate-100">Резервно копие</h2>
        <p className="mt-1 text-sm text-slate-400">
          Данните се пазят локално в браузъра. Ако изчистиш данните на браузъра
          (или смениш устройство), те се губят — затова сваляй копие редовно.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COUNT_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-bold tabular-nums text-slate-100">
                {counts ? counts[key] : '—'}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? 'Сваляне…' : '⬇ Свали резервно копие'}
        </button>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-slate-100">Възстановяване от файл</h2>
        <p className="mt-1 text-sm text-slate-400">
          Избери свален .json файл. Възстановяването{' '}
          <span className="font-semibold text-rose-400">заменя изцяло</span> текущите данни.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700"
          />
          <button
            type="button"
            onClick={handleRestore}
            disabled={!selectedFile || importing}
            className="shrink-0 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Възстанови от файл
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        {pending && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-300">
              Сигурен ли си? Текущите данни ще бъдат заменени.
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              Копие от {formatExportedAt(pending.backup.exportedAt)}
            </p>

            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-amber-300/70">
                  <th className="py-1 font-medium">Таблица</th>
                  <th className="py-1 text-right font-medium">Сега</th>
                  <th className="py-1 text-right font-medium">От файла</th>
                </tr>
              </thead>
              <tbody>
                {COUNT_LABELS.map(({ key, label }) => (
                  <tr key={key} className="border-t border-amber-500/20">
                    <td className="py-1 text-slate-300">{label}</td>
                    <td className="py-1 text-right tabular-nums text-slate-500">
                      {counts ? counts[key] : '—'}
                    </td>
                    <td className="py-1 text-right font-semibold tabular-nums text-slate-100">
                      {pending.counts[key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? 'Възстановяване…' : 'Потвърди възстановяването'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={importing}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
              >
                Отказ
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-slate-100">Превалутиране: левове → евро</h2>
        <p className="mt-1 text-sm text-slate-400">
          От 2026 г. валутата е еврото. Ако старите ти суми са въведени в{' '}
          <span className="font-semibold text-slate-200">левове</span>, това действие ги
          дели еднократно на фиксирания курс {LEV_PER_EUR} и закръгля до цял евроцент.
        </p>
        <p className="mt-2 text-sm font-semibold text-rose-400">
          Действието е еднократно и необратимо. Пусни го само веднъж и само ако сумите
          наистина са в левове. Ако не си сигурен — по-добре коригирай записите ръчно.
        </p>

        {reconverted ? (
          <p className="mt-4 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2 text-sm text-slate-300">
            ✓ Превалутирането вече е извършено.
            {reconvertMsg && <span className="text-slate-400"> {reconvertMsg}</span>}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReconvert}
              disabled={reconverting || reconverted === null}
              className="mt-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reconverting ? 'Превалутиране…' : 'Превалутирай стари записи от левове в евро'}
            </button>
            {reconvertMsg && <p className="mt-3 text-sm text-slate-300">{reconvertMsg}</p>}
          </>
        )}
      </Card>
    </div>
  )
}
