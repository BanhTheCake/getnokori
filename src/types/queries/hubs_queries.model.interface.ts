import type EngineTypes from '@/enums/sources/engines/engineTypes.enum'

import type QueryTemplateTypes from '@/enums/queries/query-template-types.enum'
import type QueryOperationTypes from '@/enums/queries/queryOperationTypes.enum'
import type { QueryContext } from '@/types/queries/BaseQuery.interface'
import type HTTPRequestBodyTypes from '@/enums/queries/HTTPRequestBodyTypes.enum'

interface HubsQueriesModel{
  accountId?: string
  command: QueryOperationTypes
  constraints?: string
  context: string | null
  createdAt?: string
  engine: EngineTypes
  hubId: string
  label: string
  labelEmbedding: string | number[] | null
  query: string | null
  queryId: string
  slug?: string | null
  sourceId: string | null
  templateType?: QueryTemplateTypes
  updatedAt?: string
  headers?: string
  body?: any
  requestBodyType?: HTTPRequestBodyTypes
  queryParams?: string
  uri?: string
}

export default HubsQueriesModel
