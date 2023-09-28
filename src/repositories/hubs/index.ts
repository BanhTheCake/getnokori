import db from '@/models/mysql'
import type HubRepo from '@/types/hubs/hubs.interface'

const createHub = async (hub: HubRepo): Promise<HubRepo | null> => {
  const query = 'INSERT INTO hubs SET ?'
  const result = await db.query(query, [hub])
  return result.affectedRows > 0 ? hub : null
}

const getHub = async (accountId: HubRepo['accountId'], hubId: HubRepo['hubId']): Promise<HubRepo | null> => {
  const query = 'SELECT hubId, label, archived, createdAt, updatedAt FROM hubs WHERE accountId = ? AND hubId = ?'
  const result = await db.query(query, [accountId, hubId])
  return result.length > 0 ? result[0] : null
}

const updateHub = async (accountId: HubRepo['accountId'], hubId: HubRepo['hubId'], hub: Partial<HubRepo>): Promise<true | null> => {
  const query = 'UPDATE hubs SET ? WHERE accountId = ? AND hubId = ?'
  const result = await db.query(query, [hub, accountId, hubId])
  return result.affectedRows > 0 ? true : null
}

const getHubs = async (accountId: HubRepo['accountId'], offset: number = 0, limit: number = 10): Promise<HubRepo[] | null> => {
  const query = 'SELECT hubId, label, archived, createdAt, updatedAt FROM hubs WHERE accountId = ? ORDER BY label ASC LIMIT ?, ?'
  const result = await db.query(query, [accountId, offset, limit])
  return result.length > 0 ? result : null
}

// const updateHubTree = async (accountId: HubRepo['accountId'], hubId: HubRepo['hubId'], hubTree: HubsContents['tree']): Promise<any | null> => {
//   const query = 'INSERT INTO hubs_trees SET tree = ?, accountId = ? , hubId = ? ON DUPLICATE KEY UPDATE tree = ?'
//   const result = await db.query(query, [hubTree, accountId, hubId, hubTree])
//   return result.affectedRows > 0 ? hubTree : null
// }

const truncate = async () => {
  await db.query('TRUNCATE hubs')
  await db.query('TRUNCATE hubs_contents')
  await db.query('TRUNCATE hubs_queries')
  await db.query('TRUNCATE hubs_sources')
  await db.query('TRUNCATE hubs_folders')
  return true
}

export default {
  createHub,
  getHub,
  getHubs,
  truncate,
  updateHub,
}
