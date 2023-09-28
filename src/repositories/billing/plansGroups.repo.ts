import db from '@/models/mysql'

const createPlanGroup = async (args): Promise<true | null> => {
  const query = 'INSERT INTO billing_plans_groups SET ?'
  const result = await db.query(query, [args])
  return result.affectedRows > 0 ? true : null
}

const getPlanGroup = async (accountId, planGroupId): Promise<true | null> => {
  const query = 'SELECT * FROM billing_plans_groups WHERE accountId = ? AND planGroupId = ?'
  const result = await db.query(query, [accountId, planGroupId])
  return result ? result[0] : null
}

const getPlansInGroup = async (accountId, planGroupId, frequency = null): Promise<true | null> => {
  const params = [accountId, planGroupId]
  let query = `SELECT * FROM billing_plans_groups bpg
  JOIN billing_plans bpl ON bpg.planGroupId = bpl.planGroupId 
  WHERE bpg.platformAccountId = ? AND bpg.planGroupId = ?`

  if (frequency) {
    query += ' AND bpl.frequency = ?'
    params.push(frequency)
  }

  const result = await db.query(query, params)
  return result ? result : null
}

export default {
  createPlanGroup,
  getPlanGroup,
  getPlansInGroup,
}
