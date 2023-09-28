import HubRepository from '@/repositories/hubs'
import HubsContentRepository from '@/repositories/hubs/contents'
import type HubRepo from '@/types/hubs/hubs.interface'
import type HubsContent from '@/types/hubs/hubContents.interface'
import NodeTypes from '@/enums/hubs/nodeTypes.enum'
import HubSubNodeTypes from '@/enums/hubs/nodeSubTypes.enum'
import ID from '@/utils/ids'

const createHub = async (hub: Partial<HubRepo>, accountId: string): Promise<any | null> => {
  const hubId = ID.hubId()
  if(!hubId || !accountId || !hub.label) return null
  
  const hubToCreate: HubRepo = { hubId, accountId, label: hub.label }
  const newHub = await HubRepository.createHub(hubToCreate)
  if(!newHub) return null
  
  try {
    // Create hub root node
    await HubsContentRepository.createHubContent({
      hubId: hubId,
      accountId: accountId,
      nodeId: hubId,
      nodeType: NodeTypes.ROOT,
    })

    // Create Queries root node
    await HubsContentRepository.createHubContent({
      hubId: hubId,
      accountId: accountId,
      nodeId: ID.hubRoot(),
      parentNodeId: hubId,
      nodeType: NodeTypes.CATEGORY,
      nodeSubType: HubSubNodeTypes.QUERIES,
    })

    // Create Queries root node
    await HubsContentRepository.createHubContent({
      hubId: hubId,
      accountId: accountId,
      nodeId: ID.hubRoot(),
      parentNodeId: hubId,
      nodeType: NodeTypes.CATEGORY,
      nodeSubType: HubSubNodeTypes.SOURCES,
    })
  }
  catch (error) {
    logger.error('Exception while creating hub root nodes', error)
    return null
  }

  return { hubId }
}

const getHub = async (accountId: HubRepo['accountId'], hubId: HubRepo['hubId']): Promise<HubRepo | null> => {
  return await HubRepository.getHub(accountId, hubId)
}

const updateHub = async (accountId: HubRepo['accountId'], hubId, hub: Partial<HubRepo>): Promise<true | null> => {
  return await HubRepository.updateHub(accountId, hubId, hub)
}

const getHubs = async (accountId: HubRepo['accountId'], offset: number = 0, limit: number = 10): Promise<HubRepo[] | null> => {
  return await HubRepository.getHubs(accountId, offset, limit)
}

const truncate = async () => {
  return await HubRepository.truncate()
}

const deleteNode = async (accountId: HubsContent['accountId'], nodeId: HubsContent['nodeId']): Promise<boolish> => {
  return await HubsContentRepository.deleteNode(accountId, nodeId)
}

export default {
  createHub,
  deleteNode,
  getHub,
  getHubs,
  truncate,
  updateHub,
}
