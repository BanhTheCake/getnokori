import BillingTransactionRepo from '@/repositories/billing/transactions.repo'
import type { BillingJournalEntry } from '@/types/billing/transactions.type'
import { getCurrentMonthDates } from '@/utils/dates'
import { journalDocId } from '@/utils/ids'

export const addMoney = async ({ 
  accountId,
  productId, 
  amount, 
  description = null }: {
  accountId: string
  productId: string
  amount: number
  description?: string | null
}) => {
    
  const entry: BillingJournalEntry = {
    journalId: journalDocId(),
    accountId,
    productId,
    amount,
    date: new Date().toISOString().split('T')[0],
    description,
  }

  return BillingTransactionRepo.addMoney(entry)

}

export const deductMoney = async ({ 
  accountId, 
  productId, 
  amount, 
  description = null }: {
  accountId: string
  productId: string
  amount: number
  description?: string | null
}) => {

  const entry: BillingJournalEntry = {
    journalId: journalDocId(),
    accountId,
    productId,
    date: new Date().toISOString().split('T')[0],
    amount,
    description,
  }
  
  return BillingTransactionRepo.deductMoney(entry)
}

export const getBalance = async (accountId: string, startDate: string | null = null, endDate: string | null = null ): Promise<any | null> => {
  if(!startDate || !endDate){
    const currentPeriod = getCurrentMonthDates()
    startDate = currentPeriod.start
    endDate = currentPeriod.end
  }

  const totalBalance = await BillingTransactionRepo.getBalance(accountId, startDate, endDate)
  if(!totalBalance)
    return null

  return totalBalance.balance

}

export default {
  addMoney,
  deductMoney,
  getBalance,
}
