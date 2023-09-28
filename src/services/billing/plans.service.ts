import PlansRepo from '@/repositories/billing/plans.repo'
import BillingFreqEnums from '@/enums/billing/frequency.enum'
import IDs from '@/utils/ids'
import type { IBillingPlans } from '@/types/billing/plans.type'

export const createPlan = async(accountId: IBillingPlans['accountId'], planObj: Partial<IBillingPlans>): Promise<Partial<IBillingPlans> | null> => {
  const planId = IDs.billingPlanId()
  const newPlan = { ...planObj, planId, accountId }
  const result = await PlansRepo.createPlan(newPlan)
  if(result)
    return newPlan

  return null
}

export const getPlans = async (accountId: IBillingPlans['accountId'], frequency: IBillingPlans['frequency'] = null) => {
  return await PlansRepo.getPlans(accountId, frequency)
}

export const getPlanById = async (accountId: IBillingPlans['accountId'], planId: IBillingPlans['planId']) => {
  return await PlansRepo.getPlanById(accountId, planId)
}

export const addSubscription = async (accountId: IBillingPlans['accountId'], planId: IBillingPlans['planId']) => {
  return await PlansRepo.addSubscription(accountId, planId)
}

export const getAccountPlan = async (accountId: IBillingPlans['accountId']) => {
  return await PlansRepo.getAccountPlan(accountId)
}

export const removeSubscription = async (accountId: IBillingPlans['accountId']) => {
  return await PlansRepo.removeSubscription(accountId)
}

export const calculateCharge = async (amount: number, frequency: string): Promise<number | null> => {
  let charge: number = 0
  switch (frequency) {
    case BillingFreqEnums.MONTHLY:
      charge = amount * 1
      break

    case BillingFreqEnums.ANNUALLY:
      charge = amount * 12
      break
  }

  if(charge > 0) return +charge.toFixed(2)
  return null
}

export const deletePlans = async(accountId): Promise<true | null> => {
  return await PlansRepo.deletePlans(accountId)
}

export const deletePlan = async(accountId, planId): Promise<true | null> => {
  return await PlansRepo.deletePlan(accountId, planId)
}

export default {
  addSubscription,
  calculateCharge,
  createPlan,
  deletePlan,
  deletePlans,
  getAccountPlan,
  getPlanById,
  getPlans,
  removeSubscription,
}
