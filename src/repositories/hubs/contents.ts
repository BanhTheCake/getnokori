import db from '@/models/mysql'
import type HubsContents from '@/types/hubs/hubContents.interface'

const createHubContent = async (hubContent: HubsContents): Promise<boolish> => {
  const query = 'INSERT INTO hubs_contents SET ?'
  const result = await db.query(query, [hubContent])
  return result.affectedRows > 0 ? true : null
}

const updateHubContent = async (accountId: string, hubId: string, nodeId: string, hubContent: Partial<HubsContents>): Promise<boolish> => {
  const query = 'UPDATE hubs_contents SET ? WHERE accountId = ? and hubId = ? AND nodeId = ?'
  const result = await db.query(query, [hubContent, accountId, hubId, nodeId])
  return result.affectedRows > 0 ? true : null
}

const getHubContents = async (accountId: HubsContents['accountId'], hubId: HubsContents['hubId']): Promise<HubsContents | null> => {
  const query = `SELECT hc.hubId, hc.nodeId, hc.parentNodeId, hc.nodeType, hc.nodeSubType, hubs_sources.engine, hubs_queries.command as command,
  CASE
    WHEN hc.nodeType = "query" THEN hubs_queries.label
    WHEN hc.nodeType = "source" then hubs_sources.label
      WHEN hc.nodeType = "category" AND nodeSubType = "queries" then "Queries"
      WHEN hc.nodeType = "category" AND nodeSubType = "sources" then "Sources"
      WHEN hc.nodeType = "root" AND nodeSubType IS NULL then hubs.label
      WHEN hc.nodeType = "folder" THEN hubs_folders.label
      ELSE "Untitled"
  END as label,
  CASE
	    WHEN hc.nodeType = "category"  then 3.1
      WHEN hc.nodeType = "category" AND nodeSubType = "queries" then 3
      WHEN hc.nodeType = "category" THEN 1
      WHEN hc.nodeType = "root" THEN 0
      WHEN hc.nodeType = "folder" THEN 2
  ELSE 4
  END as sortPriority
  
  FROM hubs_contents as hc
  LEFT OUTER JOIN hubs_queries ON hc.nodeId = hubs_queries.queryId
  LEFT OUTER JOIN hubs ON hc.hubId = hubs.hubId
  LEFT OUTER JOIN hubs_folders ON hc.nodeId = hubs_folders.folderId
  LEFT OUTER JOIN hubs_sources ON hc.nodeId = hubs_sources.sourceId
  WHERE hc.accountId = ? AND hc.hubId = ?
  ORDER BY sortPriority ASC, hubs_folders.label ASC, hubs_queries.label ASC`
  
  const results = await db.query(query, [accountId, hubId])
  return results.length > 0 ? results : null
}

const getHubContentsWRecursion = async (accountId: HubsContents['accountId'], hubId: HubsContents['hubId']): Promise<HubsContents[] | null> => {
  const query = `WITH RECURSIVE hubContents AS
  (
    SELECT nodeId, label, parentNodeId, 1 AS depth, label AS path
      FROM hubs_contents
      WHERE parentNodeId IS NULL
      AND accountid = ? 
     AND hubId = ?
    UNION ALL
    SELECT c.nodeId, c.label, c.parentNodeId, hc.depth + 1, CONCAT(hc.path, ' > ', c.label)
      FROM hubContents AS hc 
        JOIN hubs_contents AS c ON hc.nodeId = c.parentNodeId
      WHERE c.archived = 0
  )
  SELECT * FROM hubContents`
  const results = await db.query(query, [accountId, hubId])
  return results
}

const getNodeById = async (accountId: string, hubId: string, nodeId: string): Promise<HubsContents | null> => {
  const query = 'SELECT * FROM hubs_contents WHERE accountId = ? AND hubId = ? AND nodeId = ?'
  const results = await db.query(query, [accountId, hubId, nodeId])
  return results.length > 0 ? results[0] : null
}

const createFolder = async (row: any): Promise<boolish> => {
  const query = 'INSERT INTO hubs_folders SET ?'
  const result = await db.query(query, row)
  return result.affectedRows > 0 ? true : null
}

const updateFolder = async (folderId: string, accountId: string, row: any): Promise<boolish> => {
  const query = 'UPDATE hubs_folders SET ? WHERE folderId = ? and accountId = ?'
  const result = await db.query(query, [row, folderId, accountId])
  return result.affectedRows > 0 ? true : null
}

const deleteFolder = async (accountId: string, folderId: string): Promise<boolish> => {
  const query = 'DELETE FROM hubs_folders WHERE folderId = ? and accountId = ?'
  const result = await db.query(query, [folderId, accountId])
  return result.affectedRows > 0 ? true : null
}

const getSourceRootNode = async (
  accountId: HubsContents['accountId'],
  hubId: HubsContents['hubId']): Promise<HubsContents | null> => {
  const query = 'SELECT * FROM hubs_contents WHERE accountId = ? AND hubId = ? AND nodeSubType = "sources" AND parentNodeId = ?'
  const result = await db.query(query, [accountId, hubId, hubId])
  return result.length > 0 ? result[0] : null
}

const getQueriesRootNode = async (
  accountId: HubsContents['accountId'],
  hubId: HubsContents['hubId']): Promise<HubsContents | null> => {
  const query = 'SELECT * FROM hubs_contents WHERE accountId = ? AND hubId = ? AND nodeSubType = "queries" AND parentNodeId = ?'
  const result = await db.query(query, [accountId, hubId, hubId])
  return result.length > 0 ? result[0] : null
}

const deleteNode = async (accountId: HubsContents['accountId'], nodeId: HubsContents['nodeId']): Promise<boolish> => {
  const query = 'DELETE FROM hubs_contents WHERE accountId = ? AND nodeId = ?'
  const result = await db.query(query, [accountId, nodeId])
  return result.affectedRows > 0 ? true : null

}

const updateNodeParentId = async (newParentNodeId: HubsContents['parentNodeId'], accountId: HubsContents['accountId'], currentParentNodeId: HubsContents['nodeId'] ): Promise<boolish> => {
  const query = 'UPDATE hubs_contents SET parentNodeId = ? WHERE accountId = ? AND parentNodeId = ?'
  const result = await db.query(query, [newParentNodeId, accountId, currentParentNodeId])
  return result.affectedRows > 0 ? true : null
}

export default {
  createFolder,
  createHubContent,
  deleteFolder,
  deleteNode,
  getHubContents,
  getHubContentsWRecursion,
  getNodeById,
  getQueriesRootNode,
  getSourceRootNode,
  updateFolder,
  updateHubContent,
  updateNodeParentId,
}
