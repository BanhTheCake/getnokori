import db from '@/models/mysql'
import type IActionModel from '@/interfaces/actions/IActionModel.interface'

const create = async (action: IActionModel): Promise<IActionModel | null> => {
  const query = 'INSERT INTO actions SET ?'
  const result = await db.query(query, [action])
  return result.length ? result[0] : null
}

const getActionById = async (actionId: IActionModel['actionId']): 
Promise<IActionModel | null> => {
  const query = 'SELECT * FROM actions WHERE actionId = ?'
  const results = await db.query(query, [actionId])
  return results.length ? results[0] : null
}

export default {
  create,
  getActionById,
}
