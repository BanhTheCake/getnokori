export interface BillingTransactionsModel {
  journalId: string
  productId: string
  accountId: string
  description?: string
  debit: number
  credit: number
  createdDate: string
  createdAt: string
  updatedAt: string
}

export interface BillingJournalEntry {
  journalId: string
  accountId: string
  productId: string
  date: string
  description?: string | null
  amount: number
}
