import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'
import ID from '@/utils/ids'
import HubService from '@/services/hubs'
import type HubsTrees from '@/types/hubs/hubTree.interface'
import HubsContentsService from '@/services/hubs/contents'
import type HubsContentsRepo from '@/types/hubs/hubContents.interface'
import HubContentsService from '@/services/hubs/contents'
import NodeTypes from '@/enums/hubs/nodeTypes.enum'
import HubsNodeTypes from '@/enums/hubs/nodeTypes.enum'
import EmbeddingsService from '@/services/embeddings/Embeddings.service'
import QueriesService from '@/services/queries'
import { findMostSimilarObject, orderObjectsBySimilarity } from '@/services/vectors/Vectors.service'

const handleCreateHub = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId

  const hub = req.body
  if(!hub || !hub.label)
    return res.status(500).json(APIResponse.failure('Hub must have a label'))

  const didCreateHub = await HubService.createHub(hub, accountId)
  if(!didCreateHub){
    // return error
    return res.status(500).json(APIResponse.failure('Failed to create hub'))
  }

  const createdHub = await HubService.getHub(accountId, didCreateHub.hubId)
  if(!createdHub){
    // return error
    return res.status(500).json(APIResponse.failure('Failed to create hub'))
  }

  return res.status(200).json(APIResponse.success({ ...createdHub }))
}

const handleUpdateHubContent = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId

  /**
   * 1 - is nodeId set? Reject cause this isn't an update.
   * 2 - if not, create a new node
   * 3 - can only update label, nodeType, and parentNodeId
   */

  const hubId = req.params.hubId

  if(!hubId)
    return res.status(500).json(APIResponse.failure('Hub ID is required'))

  const requestBody: Partial<HubsContentsRepo> = req.body || null
  if(!requestBody)
    return res.status(500).json(APIResponse.failure('Request body is required'))
  
  if(!requestBody.nodeId)
    return res.status(400).json(APIResponse.failure('Node ID is required'))

  const nodeId = requestBody.nodeId
  const node = await HubsContentsService.getNodeById(accountId, hubId, nodeId)

  if(!node)
    return res.status(400).json(APIResponse.failure('Node does not exist'))

  if(node.nodeType === HubsNodeTypes.FOLDER){
    const folderUpdate = { folderId: nodeId, ...requestBody }
    delete folderUpdate.nodeId
    const didUpdateHubContent = await HubsContentsService.updateFolder(nodeId, accountId, folderUpdate)
    if(!didUpdateHubContent)
      return res.status(500).json(APIResponse.failure('Failed to update hub folder'))

    return res.status(200).json(APIResponse.success({}))
  }

  const didUpdateHubContent = await HubsContentsService.updateHubContent(accountId, hubId, nodeId, requestBody)
  if(!didUpdateHubContent)
    return res.status(500).json(APIResponse.failure('Failed to update hub content'))

  return res.status(200).json(APIResponse.success({}))
}

const handleGetHubContent = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  const hubId = req.params.hubId

  if(!hubId)
    return res.status(500).json(APIResponse.failure('Hub ID is required'))

  const hubContents = await HubsContentsService.getHubContents(accountId, hubId)
  if(!hubContents)
    return res.status(500).json(APIResponse.failure('Failed to get hub tree'))
  
  return res.status(200).json(APIResponse.success(hubContents.shift()))
}

const handleGetHubs = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId

  const offset: number = +(req.query.offset || 0)
  const limit: number = req.query.limit ? ( +req.query.limit < 20 ? +req.query.limit : 20) : 10
  
  const hubs = await HubService.getHubs(accountId, offset, limit)
  if(!hubs){
    // return error
    return res.status(200).json(APIResponse.success([]))
  }

  return res.status(200).json(APIResponse.success(hubs))

}

const handleGetHub = async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
  if(!req?.user?.accountId) return res.status(500).json(APIResponse.failure('Account id not found.'))
  if(!req.body) return res.status(400).json(APIResponse.failure('Request body is required'))
  const hubId = req.params.hubId

  const hubDetails = await HubService.getHub(req?.user?.accountId, hubId)
  if(!hubDetails) return res.status(500).json(APIResponse.failure('Failed to get hub details'))

  return res.status(200).json(APIResponse.success(hubDetails))
}

const handleUpdateHub = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const hubId = req.params.hubId
  if(!hubId) return res.status(400).json(APIResponse.failure('Hub ID is required'))

  const requestBody = req.body || null
  if(!requestBody) return res.status(400).json(APIResponse.failure('Request body is required'))

  const didUpdateHub = await HubService.updateHub(accountId, hubId, requestBody)
  if(!didUpdateHub) return res.status(500).json(APIResponse.failure('Failed to update hub'))

  return res.status(200).json(APIResponse.success({}))
}

const handleCreateNode = async (req: Request, res: Response, next: NextFunction) => {

  if(!req.user.platformAccountId) return res.status(500).json(APIResponse.failure('Account id not found.'))
  if(!req.body) return res.status(400).json(APIResponse.failure('Request body is required'))

  const accountId = req.user.platformAccountId

  const requestBody = req.body || null
  if(!requestBody.nodeType) return res.status(400).json(APIResponse.failure('Node type is required'))
  if(!requestBody.parentNodeId) return res.status(400).json(APIResponse.failure('Parent ID is required'))
  if(!requestBody.label) return res.status(400).json(APIResponse.failure('Label is required'))

  const hubId = req.params.hubId
  if(!hubId) return res.status(400).json(APIResponse.failure('Hub ID is required'))

  const hubExists = await HubService.getHub(accountId, hubId)
  if(!hubExists) return res.status(400).json(APIResponse.failure('Hub does not exist'))

  const parentIdExists = await HubsContentsService.getNodeById(accountId, hubId, requestBody.parentNodeId)
  if(!parentIdExists) return res.status(400).json(APIResponse.failure('Parent ID does not exist'))

  const folderToCreate = {
    hubId,
    label: requestBody.label,
    accountId: accountId,
  }

  if(requestBody.nodeType === NodeTypes.FOLDER){
    const didCreateFolder = await HubsContentsService.createFolder(folderToCreate)
    if(!didCreateFolder) return res.status(500).json(APIResponse.failure('Failed to create folder'))

    const hubsContentNodeToCreate = {
      hubId,
      nodeId: didCreateFolder.nodeId,
      parentNodeId: requestBody.parentNodeId,
      nodeType: requestBody.nodeType,
      accountId: req.user.platformAccountId,
    }

    const createdNode = await HubsContentsService.createHubContent(hubsContentNodeToCreate)
    if(createdNode) {
      return res.status(200).json(APIResponse.success({ 
        nodeId: createdNode.nodeId, 
        nodeType: requestBody.nodeType, 
      }))
    }
  }
  
  logger.error('Failed to create hubs_content node. Unknown failure.')
  return res.status(500).json(APIResponse.failure('Failed to create node.'))
  
}

const handleUpdateNode = (req: Request, res: Response, next: NextFunction) => {

  const accountId: string | null = req.user.platformAccountId 
  const hubId: string | null = req.params.hubId
  const nodeId: string | null = req.params.nodeId
  const hubContent: Partial<HubsContentsRepo> = req.body

  if(!hubContent) return res.status(400).json(APIResponse.failure('Request body is required'))
  if(!accountId) return res.status(500).json(APIResponse.failure('Account id not found.'))

  const didUpdateHubNode = HubsContentsService.updateHubContent(accountId, hubId, nodeId, hubContent)
  if(!didUpdateHubNode) return res.status(500).json(APIResponse.failure('Failed to update hub node'))

  return res.status(200).json(APIResponse.success({}))

}

const handleTruncateHubs = async (req: Request, res: Response, next: NextFunction) => {
  await HubService.truncate()
  return res.status(200).json(APIResponse.success({}))
}

const handleDeleteNode = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const hubId = req.params.hubId
  const nodeId = req.params.nodeId

  if(!hubId) return res.status(400).json(APIResponse.failure('Hub ID is required'))
  if(!nodeId) return res.status(400).json(APIResponse.failure('Node ID is required'))

  const hubExists = await HubService.getHub(accountId, hubId)
  if(!hubExists) return res.status(400).json(APIResponse.failure('Hub does not exist'))

  const nodeToDelete = await HubsContentsService.getNodeById(accountId, hubId, nodeId)
  if(!nodeToDelete) return res.status(400).json(APIResponse.failure('Node does not exist'))

  if(nodeToDelete.nodeType === NodeTypes.CATEGORY) return res.status(400).json(APIResponse.failure('Top level nodes cannot be deleted'))
 
  const didDeleteNode = await HubsContentsService.deleteHubNode(accountId, hubId, nodeToDelete)
  if(!didDeleteNode) return res.status(500).json(APIResponse.failure('Failed to delete node'))

  return res.status(200).json(APIResponse.success({}))
}

const handleHubPromptRequest = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const hubId = req.params.hubId

  const { topN } = req.body

  if(!hubId) return res.status(400).json(APIResponse.failure('Hub ID is required'))

  const hubExists = await HubService.getHub(accountId, hubId)
  if(!hubExists) return res.status(400).json(APIResponse.failure('Hub does not exist'))

  const prompt = req.body.prompt || null
  if(!prompt) return res.status(400).json(APIResponse.failure('Prompt is required'))

  const queries = await QueriesService.getQueriesInHub(accountId, hubId)
  if(!queries) return res.status(500).json(APIResponse.failure('Failed to get queries in hub'))

  const promptEmbedding = await EmbeddingsService.createEmbedding(prompt)
  if(!promptEmbedding) return res.status(500).json(APIResponse.failure('Failed to create prompt embedding'))

  if(topN && topN > 0){
    const mostSimilarObjects = await orderObjectsBySimilarity(promptEmbedding, queries, 'labelEmbedding')
    if(!mostSimilarObjects || mostSimilarObjects.error) return res.status(500).json(APIResponse.failure('Failed to find most similar objects'))
    
    if(!mostSimilarObjects.objects || mostSimilarObjects.objects.length === 0) return res.status(200).json(APIResponse.success({}))

    const topNObjects = mostSimilarObjects.objects.slice(0, ( topN > 10 ? 10 : topN ))
    return res.status(200).json(APIResponse.success(topNObjects))
  }

  const mostSimilarObject = await findMostSimilarObject(promptEmbedding, queries, 'labelEmbedding')
  if(!mostSimilarObject || mostSimilarObject.error) return res.status(500).json(APIResponse.failure('Failed to find most similar object'))
  
  return res.status(200).json(APIResponse.success({
    queryId: mostSimilarObject.object.queryId,
    label: mostSimilarObject.object.label,
    confidence: mostSimilarObject.similarity ? +mostSimilarObject.similarity.toFixed(2) : 0,
  }))
}

export default {
  handleCreateHub,
  handleCreateNode,
  handleDeleteNode,
  handleGetHub,
  handleGetHubContent,
  handleGetHubs,
  handleTruncateHubs,
  handleUpdateHub,
  handleUpdateHubContent,
  handleUpdateNode,
  handleHubPromptRequest,
}
