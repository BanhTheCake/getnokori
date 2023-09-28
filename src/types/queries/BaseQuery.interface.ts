import type EngineTypes from '@/enums/sources/engines/engineTypes.enum'

export declare interface StringBasedQuery {
  queryId: string
  query: string
}

export declare interface QueryConfigSource {
  sourceId: string
  engine: EngineTypes
}

export declare interface QueryContext {
  key: string
  value: string
  isDefault: boolean
}[]
