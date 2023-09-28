import db from '@/models/mysql'
import type { IBillingPlans } from '../../types/billing/plans.type'

export const createPlan = async(planObj): Promise<true | null> => {
  const query = 'INSERT INTO billing_plans SET ?'
  const result = await db.query(query, [planObj])
  return result.affectedRows > 0 ? true : null
}

export const getPlans = async (accountId: IBillingPlans['accountId'], frequency: IBillingPlans['frequency'] = null) => {
  const params = [accountId]
  let query = 'SELECT * FROM billing_plans WHERE accountId = ?'

  if (frequency) {
    query += ' AND frequency = ?'
    params.push(frequency)
  }

  query += ' ORDER BY amount ASC'

  return await db.query(query, params)
}

export const deletePlans = async(accountId): Promise<true | null> => {
  const query = 'DELETE FROM billing_plans WHERE accountId = ?'
  const result = await db.query(query, [accountId])
  return result.affectedRows > 0 ? true : null
}

export const deletePlan = async(accountId, planId): Promise<true | null> => {
  const query = 'DELETE FROM billing_plans WHERE accountId = ? AND planId = ?'
  const result = await db.query(query, [accountId, planId])
  return result.affectedRows > 0 ? true : null
}

export const getPlanById = async (accountId: IBillingPlans['accountId'], planId: IBillingPlans['planId']) => {
  const query = 'SELECT * FROM billing_plans WHERE accountId = ? AND planId = ?'
  const result = await db.query(query, [accountId, planId])
  return result ? result[0] : null
}

export const getAccountPlan = async (accountId: IBillingPlans['accountId']) => {
  const query = 'SELECT * FROM billing_plans_subscriptions WHERE accountId = ?'
  const result = await db.query(query, [accountId])
  return result ? result[0] : null
}

export const removeSubscription = async (accountId: IBillingPlans['accountId']) => {
  const query = 'DELETE FROM billing_plans_subscriptions WHERE accountId = ?'
  return await db.query(query, [accountId])
}

export const addSubscription = async (accountId: IBillingPlans['accountId'], planId: IBillingPlans['planId']) => {
  const query = 'INSERT INTO billing_plans_subscriptions SET accountId = ?, planId = ?, status = 1'
  const result = await db.pool.query(query, [accountId, planId])
  return result.affectedRows > 0 ? true : null
}

export default {
  createPlan,
  getPlans,
  getPlanById,
  getAccountPlan,
  removeSubscription,
  addSubscription,
  deletePlans,
  deletePlan,
}
