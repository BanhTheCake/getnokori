import db from '@/models/mysql'
import type { ClassifierRow } from '@/types/classifiers/classifiers.interface'

const create = async (classifier: ClassifierRow): Promise<boolish> => {
  const query = 'INSERT INTO classifiers SET ?'
  const result = await db.query(query, [classifier])
  return result.affectedRows === 1
}

const get = async (account: string, classifierId: string): Promise<ClassifierRow | null> => {
  const query = 'SELECT * FROM classifiers WHERE accountId = ? AND classifierId = ? AND active = 1'
  const result = await db.query(query, [account, classifierId])
  return result.length ? result[0] : null
}

const getMany = async (account: string): Promise<ClassifierRow[] | null> => {
  const query = 'SELECT classifierId, name, createdAt, updatedAt FROM classifiers WHERE accountId = ? AND active = 1'
  const results = await db.query(query, [account])
  return results.length ? results : null
}

const update = async (accountId: string, classifierId: string, classifier: ClassifierRow): Promise<boolish> => {
  const query = 'UPDATE classifiers SET ? WHERE accountId = ? AND classifierId = ?'
  const result = await db.query(query, [classifier, accountId, classifierId])
  return result.affectedRows === 1
}

const archive = async (accountId: string, classifierId: string): Promise<boolish> => {
  const query = 'UPDATE classifiers SET active = 0 WHERE accountId = ? AND classifierId = ?'
  const result = await db.query(query, [accountId, classifierId])
  return result.affectedRows === 1
}

export default {
  create,
  get,
  getMany,
  update,
  archive,
}
