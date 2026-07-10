import { startOfMonth, endOfMonth, format } from 'date-fns'
import { db } from '../../db/database'
import type { Transaction, MonthlySummary, CategoryBreakdown } from './types'

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function fromCents(cents: number): number {
  return cents / 100
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function addTransaction(tx: Transaction): Promise<number> {
  return db.transactions.add(tx)
}

export async function getTransactionsForMonth(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const reference = new Date(year, month - 1, 1)
  const from = format(startOfMonth(reference), 'yyyy-MM-dd')
  const to = format(endOfMonth(reference), 'yyyy-MM-dd')

  return db.transactions.where('date').between(from, to, true, true).sortBy('date')
}

export function summarize(transactions: Transaction[]): MonthlySummary {
  let incomeCents = 0
  let expenseCents = 0
  const categoryCents = new Map<string, number>()

  for (const tx of transactions) {
    const cents = toCents(tx.amount)
    if (tx.type === 'income') {
      incomeCents += cents
    } else {
      expenseCents += cents
      categoryCents.set(tx.category, (categoryCents.get(tx.category) ?? 0) + cents)
    }
  }

  const breakdown: CategoryBreakdown[] = [...categoryCents.entries()]
    .map(([category, cents]) => ({
      category,
      total: fromCents(cents),
      percentage: expenseCents > 0 ? round2((cents / expenseCents) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    income: fromCents(incomeCents),
    expense: fromCents(expenseCents),
    balance: fromCents(incomeCents - expenseCents),
    breakdown,
  }
}

const moneyFormatter = new Intl.NumberFormat('bg-BG', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

export const LEV_PER_EUR = 1.95583

export const RECONVERT_FLAG = 'finance.currency.reconverted'

export async function isReconverted(): Promise<boolean> {
  const flag = await db.settings.get(RECONVERT_FLAG)
  return flag?.value === '1'
}

export async function reconvertLevToEuro(): Promise<{ converted: number; alreadyDone: boolean }> {
  if (await isReconverted()) {
    return { converted: 0, alreadyDone: true }
  }

  const all = await db.transactions.toArray()
  await db.transaction('rw', db.transactions, db.settings, async () => {
    const flag = await db.settings.get(RECONVERT_FLAG)
    if (flag?.value === '1') return

    for (const tx of all) {
      if (tx.id != null) {
        await db.transactions.update(tx.id, { amount: round2(tx.amount / LEV_PER_EUR) })
      }
    }
    await db.settings.put({ key: RECONVERT_FLAG, value: '1' })
  })

  return { converted: all.length, alreadyDone: false }
}
