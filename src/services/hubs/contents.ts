import HubsContentRepo from '@/repositories/hubs/contents'
import type HubsContents from '@/types/hubs/hubContents.interface'
import HubsNodeTypes from '@/enums/hubs/nodeTypes.enum'
import { treeFromObjects } from '@/utils/objects'
import ID from '@/utils/ids'

const createHubContent = async (
  hubContent: HubsContents,
): Promise<{nodeId: string} | null> => {
  const nodeId = hubContent.nodeId ? hubContent.nodeId : ID.hubNodeId()
  const hubContentToCreate: HubsContents = { ...hubContent, nodeId }

  const didCreateHubNode = await HubsContentRepo.createHubContent(hubContentToCreate)
  if(!didCreateHubNode) return null

  return { nodeId }
}

const updateHubContent = async (accountId: string, hubId: string, nodeId: string, hubContent: Partial<HubsContents>): Promise<boolish> => {
  return await HubsContentRepo.updateHubContent(accountId, hubId, nodeId, hubContent)
}

const getHubContents = async (accountId: HubsContents['accountId'], hubId: HubsContents['hubId']): Promise<any | null> => {
  const hubContents = await HubsContentRepo.getHubContents(accountId, hubId)
  if(!hubContents) return []

  const parsedContents = treeFromObjects(hubContents)
  return parsedContents
}

const getNodeById = async (accountId: string, hubId: string, nodeId: string): Promise<HubsContents | null> => {
  return await HubsContentRepo.getNodeById(accountId, hubId, nodeId)
}

const createFolder = async (row: any): Promise<{ nodeId: string } | null> => {
  const folderId = ID.hubNodeId()
  const folderToCreate = { ...row, folderId }
  const result = await HubsContentRepo.createFolder(folderToCreate)
  if(!result) return null

  return { nodeId: folderId }
}

const updateFolder = async (folderId: string, accountId: string, row: any): Promise<boolish> => {
  return await HubsContentRepo.updateFolder(folderId, accountId, row)
}

const getSourceRootNode = async (
  accountId: HubsContents['accountId'],
  hubId: HubsContents['hubId']): Promise<HubsContents | null> => {
  return await HubsContentRepo.getSourceRootNode(accountId, hubId)
}

const getQueriesRootNode = async (
  accountId: HubsContents['accountId'],
  hubId: HubsContents['hubId']): Promise<HubsContents | null> => {
  return await HubsContentRepo.getQueriesRootNode(accountId, hubId)
}

const deleteHubNode = async (accountId: string, hubId: string, node: HubsContents): Promise<boolish> => {
  try {
    if(!node.nodeId) throw new Error('Node ID is required')
  }
  catch (error) {
    logger.error('Failed to delete node', error)
    return null
  }
  
  /**
   * Handle deleting folders
   */
  if(node.nodeType === HubsNodeTypes.FOLDER){
    // Map children to the parentNodeId
    const didUpdateParentNodes = await HubsContentRepo.updateNodeParentId(node.parentNodeId, accountId, node.nodeId)
    if(!didUpdateParentNodes)
      logger.warn('Failed to update parent nodes while deleting folder')

    const didDeleteFolderNode = await HubsContentRepo.deleteNode(accountId, node.nodeId)
    if(!didDeleteFolderNode){
      logger.error('Failed to delete folder node')
      return null
    }
    // Delete the folder from folders table
    const didDeleteFolder = await HubsContentRepo.deleteFolder(accountId, node.nodeId)
    if(!didDeleteFolder){
      logger.error('Failed to delete folder')
      return null
    }
    // Anything else?
  }

  return true
}

export default {
  createFolder,
  deleteHubNode,
  updateFolder,
  createHubContent,
  getHubContents,
  getNodeById,
  getQueriesRootNode,
  getSourceRootNode,
  updateHubContent,
}
