import db from '@/models/mysql'
import type { BillingJournalEntry } from '@/types/billing/transactions.type'

const addMoney = async ({ 
  journalId, 
  accountId,
  productId, 
  amount, 
  date,
  description = null }: BillingJournalEntry) => {
  const query = 'INSERT INTO billing_transactions SET journalId = ?, accountId = ?, productId = ?, createdDate = ?, description = ?, credit = ?'
  const result = await db.query(query, [journalId, accountId, productId, date, description, amount])
  return result.affectedRows > 0 ? true : null
}

const deductMoney = async ({ 
  journalId, 
  accountId, 
  productId, 
  amount, 
  date,
  description = null }: BillingJournalEntry) => {
  const query = 'INSERT INTO billing_transactions SET journalId = ?, accountId = ?, productId = ?, createdDate = ?, description = ?, debit = ?'
  const result = await db.query(query, [journalId, accountId, productId, date, description, amount])
  return result.affectedRows > 0 ? true : null
}

const getBalance = async (accountId: string, startDate: string, endDate: string ): Promise<{balance: number} | null> => {
  const query = 'SELECT SUM(credit) - SUM(debit) AS balance FROM billing_transactions WHERE accountId = ? AND createdDate BETWEEN ? AND ?'
  const result = await db.query(query, [accountId, startDate, endDate])
  return result ? result[0] : null
}

export default {
  addMoney,
  deductMoney,
  getBalance,
}
