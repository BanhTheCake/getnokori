import db from '@/models/mysql'
import type { ClassifierClassRow } from '@/types/classifiers/classifiers.interface'

const create = async (classifierClass: ClassifierClassRow): Promise<boolish> => {
  const query = 'INSERT INTO classifiers_classes SET ?'
  const result = await db.query(query, [classifierClass])
  return result.affectedRows ? true : false
}

const getClasses = async (accountId: string, classifierId: string): Promise<ClassifierClassRow[] | null> => {
  const query = 'SELECT classId, label, observations FROM classifiers_classes WHERE classifierId = ? and accountId = ?'
  const results = await db.query(query, [classifierId, accountId])
  return results.length ? results : null
}

const getClassesWithContext = async (accountId: string, classifierId: string): Promise<ClassifierClassRow[] | null> => {
  const query = 'SELECT classId, label, context, observations FROM classifiers_classes WHERE classifierId = ? and accountId = ?'
  const results = await db.query(query, [classifierId, accountId])
  return results.length ? results : null
}

const getClass = async (accountId: string, classifierId: string, label: string): Promise<ClassifierClassRow | null> => {
  const query = 'SELECT * FROM classifiers_classes WHERE classifierId = ? and accountId = ? and label = ?'
  const result = await db.query(query, [classifierId, accountId, label])
  return result.length ? result[0] : null
}

const updateClass = async (accountId: string, classifierId: string, classId: string, context: string, observations: number): Promise<boolish> => {
  const query = 'UPDATE classifiers_classes SET context = ?, observations = ? WHERE classId = ? and classifierId = ? and accountId = ?'
  const result = await db.query(query, [context, observations, classId, classifierId, accountId])
  return result.affectedRows ? true : false
}

const deleteClass = async (accountId: string, classifierId: string, classId: string): Promise<boolish> => {
  const query = 'DELETE FROM classifiers_classes WHERE classId = ? and classifierId = ? and accountId = ?'
  const result = await db.query(query, [classId, classifierId, accountId])
  return result.affectedRows ? true : false
}

const deleteAll = async (accountId: string, classifierId: string): Promise<boolish> => {
  const query = 'DELETE FROM classifiers_classes WHERE classifierId = ? and accountId = ?'
  const result = await db.query(query, [classifierId, accountId])
  return result.affectedRows ? true : false
}

export default {
  create,
  getClasses,
  getClassesWithContext,
  getClass,
  updateClass,
  deleteClass,
  deleteAll,
}
