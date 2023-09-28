import db from '@/models/mysql'
import type HubsSources from '@/types/sources/hubsSources.interface'

const getSource = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId']): 
Promise<HubsSources | null> => {
  const query = 'SELECT sourceId, hubId, label, engine, connectionSettings, createdAt, updatedAt FROM hubs_sources WHERE accountId = ? AND sourceId = ?'
  const result = await db.query(query, [accountId, sourceId])
  return result.length > 0 ? result[0] : null
}

const getSources = async (
  accountId: HubsSources['accountId'],
  hubId: HubsSources['hubId'],
): Promise<HubsSources[] | null> => {
  const query = 'SELECT * FROM hubs_sources WHERE accountId = ? AND hubId = ?'
  const result = await db.query(query, [accountId, hubId])
  return result.length > 0 ? result : null
}

const createSource = async (row: HubsSources): Promise<boolish> => {
  const query = 'INSERT INTO hubs_sources SET ?'
  const result = await db.query(query, [row])
  return result.affectedRows > 0 ? true : null
}

const updateSource = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId'],
  row: Partial<HubsSources>): Promise<boolish> => {
  const query = 'UPDATE hubs_sources SET ? WHERE accountId = ? AND sourceId = ?'
  const result = await db.query(query, [row, accountId, sourceId])
  return result.affectedRows > 0 ? true : null
}

const deleteSource = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId']):
Promise<boolish> => {
  const query = `
    DELETE hubs_sources, hubs_contents FROM hubs_sources
    JOIN hubs_contents ON hubs_sources.sourceId = hubs_contents.nodeId
    WHERE hubs_sources.accountId = ? AND hubs_sources.sourceId = ?`
  const result = await db.query(query, [accountId, sourceId])
  return result.affectedRows > 0 ? true : null
}

const getConnectionSettings = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId'],
): Promise<Partial<HubsSources> | null> => {
  const query = 'SELECT connectionSettings FROM hubs_sources WHERE sourceId = ? AND accountId = ?'
  const result = await db.query(query, [sourceId, accountId])
  return result.length > 0 ? result[0] : null
}

export default {
  createSource,
  deleteSource,
  getConnectionSettings,
  getSource,
  getSources,
  updateSource,
}
