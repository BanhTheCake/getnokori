import type HubNodeTypes from '@/enums/hubs/nodeTypes.enum'
import type HubSubNodeTypes from '@/enums/hubs/nodeSubTypes.enum'

interface HubContentsRepo {
  hubId: string
  accountId: string
  nodeId?: string
  parentNodeId?: string
  nodeType: HubNodeTypes
  nodeSubType?: HubSubNodeTypes
  meta?: string | null
  isExpanded?: boolean | null
  label?: string | null
  createdAt?: string
  updatedAt?: string
  archived?: boolean
}

export default HubContentsRepo
