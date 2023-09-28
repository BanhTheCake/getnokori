import db from '@/models/mysql'
import type IBaseTrigger from '@/interfaces/triggers/IBaseTrigger.interface'

const createTrigger = async (trigger: IBaseTrigger): Promise<boolish> => {
  const query = 'INSERT INTO triggers SET ?'
  const result = await db.query(query, [trigger])
  return result.affectedRows ? true : null
}

const deleteTrigger = async (accountId: string, triggerId: IBaseTrigger['triggerId']): Promise<boolish> => {
  const query = 'DELETE FROM triggers WHERE accountId = ? AND triggerId = ?'
  const result = await db.query(query, [accountId, triggerId])
  return result.affectedRows ? true : null
}

const getTriggersByObjectId = async (accountId: string, objectId: string): Promise<IBaseTrigger[] | null> => {
  const query = 'SELECT * FROM triggers WHERE accountId = ? AND objectId = ?'
  const results = await db.query(query, [accountId, objectId])
  return results ? results : null
}

export default {
  createTrigger,
  deleteTrigger,
  getTriggersByObjectId,
}
