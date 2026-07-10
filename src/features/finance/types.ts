export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id?: number
  type: TransactionType
  amount: number
  category: string
  note?: string
  date: string
}

export interface CategoryBreakdown {
  category: string
  total: number
  percentage: number
}

export interface MonthlySummary {
  income: number
  expense: number
  balance: number
  breakdown: CategoryBreakdown[]
}
