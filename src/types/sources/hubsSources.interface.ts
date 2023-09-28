import type EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type HubNodeTypes from '@/enums/hubs/nodeTypes.enum'

interface HubsSources {
  sourceId: string
  hubId: string
  accountId?: string
  nodeType?: HubNodeTypes
  parentNodeId?: string | null
  name: string
  engine: EngineTypes
  driver: string
  connectionSettings: string
  createdAt?: string
  updatedAt?: string
}

export default HubsSources
