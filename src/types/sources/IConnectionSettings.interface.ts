import type EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type HTTPMethods from '@/enums/queries/HTTPQueryMethods.enum'

/**
 This makes use of the "discriminated union" pattern.
 */
interface BaseConnectionSettings {
  type: EngineTypes
}

interface SqlConnectionSettings extends BaseConnectionSettings {
  type: EngineTypes.MYSQL | EngineTypes.POSTGRES
  host: string
  port: number
  database: string
  user: string
  password: string
}

interface HttpConnectionSettings extends BaseConnectionSettings {
  type: EngineTypes.HTTP
  url: string
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

type ConnectionSettings = SqlConnectionSettings | HttpConnectionSettings

export interface SourceConfiguration {
  hubId: string
  label: string
  engine: EngineTypes
  connectionSettings: ConnectionSettings
}

export default SourceConfiguration
