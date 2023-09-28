import db from '@/models/mysql'
import type HubsQueries from '@/types/queries/hubs_queries.model.interface'

export const getQueryById = async(accountId: string, queryId: string): Promise<HubsQueries | null> => {
  const query = 'SELECT * FROM hubs_queries WHERE queryId = ? AND accountId = ?'
  const result = await db.query(query, [queryId, accountId])
  return result.length > 0 ? result[0] : null
}

const createQuery = async (newQuery: Partial<HubsQueries>): Promise<boolish> => {
  const query = 'INSERT INTO hubs_queries SET ?'
  const result = await db.query(query, [newQuery])
  return result.affectedRows > 0 ? true : null
}

const nullifyQuerySourceId = async (
  accountId: string, 
  sourceId: string): 
Promise<boolish> => {
  const query = 'UPDATE hubs_queries SET sourceId = NULL WHERE accountId = ? AND sourceId = ?'
  const result = await db.query(query, [accountId, sourceId])
  return result.affectedRows > 0 ? true : null
}

const deleteQuery = async (
  accountId: HubsQueries['accountId'],
  queryId: HubsQueries['queryId']):
Promise<boolish> => {
  const query = `
    DELETE FROM hubs_queries WHERE accountId = ? AND queryId = ?`
  const result = await db.query(query, [accountId, queryId])
  return result.affectedRows > 0 ? true : null
}

const updateQuery = async (
  accountId: HubsQueries['accountId'],
  row: Partial<HubsQueries>,
  queryId: HubsQueries['queryId']): 
Promise<boolish> => {
  const query = `
    UPDATE hubs_queries SET ? WHERE accountId = ? AND queryId = ?`
  const result = await db.query(query, [row, accountId, queryId])
  return result.affectedRows > 0 ? true : null
}

export const getQueriesInHub = async (
  accountId: HubsQueries['accountId'],
  hubId: HubsQueries['hubId']):
Promise<HubsQueries[]> => {
  const query = `
    SELECT * FROM hubs_queries WHERE accountId = ? AND hubId = ?`
  const result = await db.query(query, [accountId, hubId])
  return result
}

export default {
  createQuery,
  deleteQuery,
  getQueryById,
  getQueriesInHub,
  nullifyQuerySourceId,
  updateQuery,
}
