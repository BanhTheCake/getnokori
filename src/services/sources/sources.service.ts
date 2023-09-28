import SourcesRepo from '@/repositories/sources/sources.repo'
import type SourcesInterface from '@/types/sources/hubsSources.interface'
import DBConnectionFactory from '@/services/sources/connections/DBConnectionFactory.class'
import HubsContentRepository from '@/repositories/hubs/contents'
import type HubsSources from '@/types/sources/hubsSources.interface'
import NodeTypes from '@/enums/hubs/nodeTypes.enum'
import IDs from '@/utils/ids'
import ConnectionUtils from '@/services/sources/utils/connection.utils'
import type EngineTypes from '@/enums/sources/engines/engineTypes.enum'

const getSource = async (
  accountId: SourcesInterface['accountId'],
  sourceId: SourcesInterface['sourceId']): 
Promise<SourcesInterface | null> => {
  return await SourcesRepo.getSource(accountId, sourceId)
}

const getSources = async (
  accountId: SourcesInterface['accountId'],
  hubId: SourcesInterface['hubId'],
): Promise<SourcesInterface[] | null> => {
  return await SourcesRepo.getSources(accountId, hubId)
}

const getConnectionSettings = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId']):
Promise<object | null> => {
  const settings = await SourcesRepo.getConnectionSettings(accountId, sourceId)
  if(settings?.connectionSettings)
    return JSON.parse(settings.connectionSettings)

  return null
}

const getSourceEngineType = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId']):
Promise<EngineTypes | null> => {
  const source = await getSource(accountId, sourceId)

  if(!source?.engine)
    return null

  // switch (source.engine) {
  //   case EngineTypes.MYSQL:
  //     return EngineTypes.MYSQL
  //     break
  
  //   default:
  //     break
  // }

  return source.engine
}

interface CreateSourceResponse {
  source: Omit<SourcesInterface, 'connectionSettings'>
}
const createSource = async (row: SourcesInterface, parentNodeId: string): Promise<CreateSourceResponse | null> => {
  const sourceId: string = IDs.sourceId()
  const sourceToCreate = {
    ...row,
    sourceId,
  }

  if(!row.accountId)
    return null

  sourceToCreate.connectionSettings = JSON.stringify(sourceToCreate.connectionSettings)
  
  const didCreateSource = await SourcesRepo.createSource(sourceToCreate)
  if(!didCreateSource){
    logger.error('Error creating source')
    return null
  }

  try {
    await HubsContentRepository.createHubContent({
      hubId: row.hubId,
      accountId: row.accountId,
      nodeId: sourceId,
      parentNodeId: parentNodeId,
      nodeType: NodeTypes.SOURCE,
    })

    const { connectionSettings, ...response }: {connectionSettings: any } & Omit<SourcesInterface, 'connectionSettings'> = sourceToCreate
    response['nodeId'] = sourceId

    return { source: response }
  }
  catch (error) {
    logger.error('Error creating hub content for source', { error })
  }

  logger.error('Error creating source')
  return null
}

const updateSource = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId'],
  row: Partial<HubsSources>): Promise<boolish> => {
  return await SourcesRepo.updateSource(accountId, sourceId, row)
}

const deleteSource = async (
  accountId: HubsSources['accountId'],
  sourceId: HubsSources['sourceId']):
Promise<boolish> => {
  return await SourcesRepo.deleteSource(accountId, sourceId)
}

/**
 * Returns a list of schemas for a given source
 *
 * @param   {string}  source      The source definition object
 * @param   {any}  connection  The connection settings object
 *
 * @return  {[type]}           [return description]
 */
const testConnection = async (source: any): Promise<{result: boolean | null; error: any}> => {
  
  try {
    const engineType = source.engine
    const DBFactory = await new DBConnectionFactory()
  
    if(!engineType) throw new Error('Engine type not defined')
    
    const DBInstance = await DBFactory.getInstance(engineType, source.connectionSettings)
    if(!DBInstance) throw new Error('Error creating instance of database connection')

    const { result, error } = await DBInstance.getConnection()
    if(result && !error){
      await ConnectionUtils.closeConnection(DBInstance)

      return { result: true, error: null }
    }
    
    return { result: false, error }
  }
  catch (error: any) {
    return { result: null, error: error }
  }
}

/**
 * Returns a list of schemas for a given source
 *
 * @param   {string}  source      The source definition object
 * @param   {any}  connection  The connection settings object
 *
 * @return  {[type]}           [return description]
 */
const getSchemas = async(source: any, connection: any) => {
  const engineType = source.engine
  const DBFactory = new DBConnectionFactory()
  const connectionSettings = JSON.parse(connection.connectionSettings)

  const db = await DBFactory.getInstance(engineType, connectionSettings)
  if(!db){
    logger.error('Error creating instance of database connection'), {
      engineType,
      source,
    }
    return null
  }

  const schemas = await db.getSchemas()
  if(!schemas){
    logger.warn('No schemas found in source.', { 
      source,
    })

    return []
  }

  return schemas.map(schema => schema.Database)
}

/**
 * Returns a detailed list of schema entities for a given source+schema
 * @param   {any}  source  The source definition object
 * @param   {any}  connection  The connection settings object
 * @param   {string}  schema  The schemaId to get entities for
 */
const getSchemaEntities = async(source: any, connection: any, schema: string, includeTypes: boolean = false) => {

  const engineType = source.engine
  const DBFactory = new DBConnectionFactory()
  const connectionSettings = JSON.parse(connection.connectionSettings)

  // TODO: Refactor to use DBInstance approach implemented in validate connection
  
  // const db = await DBFactory.getInstance(engineType, connectionSettings)
  // if(!db){
  //   logger.error('Error creating instance of database connection'), {
  //     engineType,
  //     source,
  //   }
  //   return null
  // }

  // const entities = await db.getSchemaEntities(schema, includeTypes)
  // if(!entities){
  //   logger.warn('No enties found in schema', { 
  //     source,
  //     schema,
  //   })

  //   return []
  // }
  
  return true // entities
}

export default {
  createSource,
  deleteSource,
  getConnectionSettings,
  getSchemaEntities,
  getSchemas,
  getSource,
  getSourceEngineType,
  getSources,
  testConnection,
  updateSource,
}
