import QueriesRepository from '@/repositories/queries/index.repo'
// import ConnectionSettingsRepo from '@/repositories/hubs/sources/connectionSettings.repo'
import SourcesService from '@/services/sources/sources.service'
import DBConnectionFactory from '@/services/sources/connections/DBConnectionFactory.class'
import type HubsQueries from '@/types/queries/hubs_queries.model.interface'
import HubContentsService from '@/services/hubs/contents'
import { dasherize } from '@/utils/strings'
import NodeTypes from '@/enums/hubs/nodeTypes.enum'
import ID from '@/utils/ids'
import ConnectionUtils from '@/services/sources/utils/connection.utils'
import ContextBuilder from '@/services/queries/ContextBuilder'
import type { INokoriDBQuery } from '@/types/queries/INokoriDBQuery.interface'
import ClientLogsService from '@/services/logs/ClientLogs.service'
import TriggersService from '@/services/triggers'
import HubsContentService from '@/services/hubs/contents'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import HTTPMethods from '@/enums/queries/HTTPQueryMethods.enum'
import SQLCommands from '@/enums/queries/SQLCommands.enum'
import EmbeddingsService from '@/services/embeddings/Embeddings.service'

import RunnerFactory from '@/services/queries/runners/RunnerFactory.service'
import type HTTPRequestBodyTypes from '@/enums/queries/HTTPRequestBodyTypes.enum'

export const execute = async (accountId: string, queryDefinition: INokoriDBQuery['config']): Promise<{data: any | null; error: any | null}> => {

  if(!queryDefinition?.source?.engine){
    logger.error('Engine is required', {
      accountId,
      queryDefinition,
    })
    return { data: null, error: 'Engine is required' }
  }

  const RunnerInstance = RunnerFactory.getRunner(queryDefinition.source.engine)
  if(!RunnerInstance)
    return { data: null, error: 'No runner instance found' }
  
  const runner = new RunnerInstance(accountId, queryDefinition)
  
  return await runner.run()
}

/**
 * Creates a new query within a given hub
 *
 * @return  {[type]}             [return description]
 */
interface CreateQueryResponse { data: HubsQueries | null; error: any | null }
const createQuery = async (accountId: string, query: any): Promise<CreateQueryResponse> => {
  const { parentNodeId, ...queryToCreate } = query
  const newQuery: HubsQueries = { ...queryToCreate, accountId }

  if(!parentNodeId || parentNodeId === query.hubId){
    const hubRootQueryNode = await HubsContentService.getQueriesRootNode(accountId, query.hubId)

    if(!hubRootQueryNode){
      logger.error('Hub root query node not found', { accountId, query })
      return { data: null, error: true }
    }
    query.parentNodeId = hubRootQueryNode.nodeId
  }

  newQuery.queryId = ID.queryId()

  if(!newQuery.label || newQuery.label === ''){
    logger.error('Label is required', { accountId, query })
    return { data: null, error: 'Label is required' }
  }

  newQuery.slug = dasherize(newQuery.label)

  const embedding = await EmbeddingsService.createEmbedding(newQuery.label)
  if(!embedding)
    logger.error('Error creating embedding', { accountId, query: newQuery })
  
  if(embedding)
    newQuery.labelEmbedding = JSON.stringify(embedding)

  // Was a source id provided?
  const sourceProvided = !!query?.sourceId
  if(sourceProvided){
    const sourceEngineType = await SourcesService.getSourceEngineType(accountId, query.sourceId)
    if(!sourceEngineType)
      query.sourceId = null
    
    if(sourceEngineType)
      newQuery.engine = sourceEngineType
  }
 
  if(newQuery?.command && !sourceProvided)
    return { data: null, error: 'Command is not valid without a source' }

  if(newQuery?.query && !sourceProvided)
    return { data: null, error: 'Query is not valid without a source' }

  if(newQuery?.uri && !sourceProvided)
    return { data: null, error: 'Uri is not valid without a source' }

  if(newQuery?.body && !sourceProvided)
    return { data: null, error: 'Body is not valid without a source' }

  if(newQuery?.headers && !sourceProvided)
    return { data: null, error: 'Headers is not valid without a source' }
  
  if(newQuery?.queryParams && !sourceProvided)
    return { data: null, error: 'queryParams is not valid without a source' }

  // Make sure command is valid
  if(newQuery?.command){
    const upperCasedCommand = newQuery.command.toUpperCase()

    // Need to make sure the command is valid for engine type
    if(newQuery?.engine === EngineTypes.HTTP){
      
      if(!HTTPMethods[upperCasedCommand])
        return { data: null, error: 'Command is not valid for HTTP engine type' }
    }

    if(newQuery?.engine !== EngineTypes.HTTP){
      if(!SQLCommands[upperCasedCommand])
        return { data: null, error: 'Command is not valid for non-HTTP engine type' }
    }
  }

  try {
    const createdQuery = await QueriesRepository.createQuery(newQuery)
    if(!createdQuery){
      logger.error('Unknown error creating query', { newQuery })
      return { data: null, error: true }
    }
  }
  catch (error) {
    logger.error('Error creating query', error)
    return { data: null, error }
  }

  try {
    const parentNodeId = query.parentNodeId ? query.parentNodeId : query.hubId
    const createdHubNode = await HubContentsService.createHubContent({
      hubId: query.hubId,
      accountId: accountId,
      parentNodeId: parentNodeId,
      nodeId: newQuery.queryId,
      nodeType: NodeTypes.QUERY,
      // label: newQuery.label ? newQuery.label : null,
    })

    if(!createdHubNode){
      logger.error('Unknown error creating hub node', { newQuery })
      return { data: null, error: true }
    }

    return { data: newQuery, error: false }
  }
  catch (error) {
    logger.error('Error adding query to hub', { error, query, newQuery })
    return { data: null, error: error }
  }
}

const deleteQuery = async (
  accountId: HubsQueries['accountId'],
  queryId: HubsQueries['queryId']):
Promise<boolish> => {
  return await QueriesRepository.deleteQuery(accountId, queryId)
}

const nullifyQuerySourceId = async (
  accountId: string, 
  sourceId: string): 
Promise<boolish> => {
  // TODO: should we make hubId required again?
  return await QueriesRepository.nullifyQuerySourceId(accountId, sourceId)
}

export const getQueryById = async(accountId: string, queryId: string): Promise<INokoriDBQuery | null> => {
  const queryDefinition = await QueriesRepository.getQueryById(accountId, queryId)
  if(!queryDefinition){
    logger.error('Query definition not found for queryId', {
      accountId,
      queryId,
    })
    return null
  }

  const mappedQuery = await _mapQueryToInterface(queryDefinition)
  return mappedQuery
}

export const updateQuery = async (
  accountId: HubsQueries['accountId'],
  dto: Partial<INokoriDBQuery>,
  queryId: HubsQueries['queryId']): 
Promise<boolish> => {

  const update: Partial<HubsQueries> = {}
  
  if(!dto.meta){
    logger.error('{meta: ...} - No meta data provided for query update', { dto })
    return null
  }

  if(dto.meta.label){
    update.label = dto.meta.label
    update.slug = dasherize(dto.meta.label)

    const embedding = await EmbeddingsService.createEmbedding(update.label)
    if(!embedding)
      logger.error('Error creating embedding', { accountId, query: update })
    
    if(embedding)
      update.labelEmbedding = JSON.stringify(embedding)
  }

  // Need to make sure that the source exists in the hub?
  if(dto.config?.source?.sourceId)
    update.sourceId = dto.config.source.sourceId

  if(dto.config?.command)
    update.command = dto.config.command.toUpperCase() as SQLCommands | HTTPMethods

  if(dto.config?.source?.engine)
    update.engine = dto.config.source.engine

  if(dto.config?.query?.query)
    update.query = dto.config.query.query
  
  if(dto.config?.context)
    update.context = JSON.stringify(dto.config.context)

  if(dto.config?.uri)
    update.uri = dto.config.uri

  if(dto.config?.body)
    update.body = dto.config.body

  if(dto.config?.requestBodyType)
    update.requestBodyType = dto.config.requestBodyType

  if(dto.config?.headers)
    update.headers = typeof dto.config.headers === 'string' ? dto.config.headers : JSON.stringify(dto.config.headers)
  
  if(dto.config?.queryParams)
    update.queryParams = typeof dto.config.queryParams === 'string' ? dto.config.queryParams : JSON.stringify(dto.config.queryParams)

  // if(dto.config?.constraints)
  //   update.constraints = JSON.stringify(dto.config.constraints)
  
  return await QueriesRepository.updateQuery(accountId, update, queryId)
}

async function _mapQueryToInterface(query: HubsQueries): Promise<INokoriDBQuery> {
  let queryContext = null
  if(query?.context){
    if(typeof query.context === 'string')
      queryContext = JSON.parse(query.context)
    else
      queryContext = query.context
  }

  let headers = null
  if(query?.headers){
    if(typeof query.headers === 'string')
      headers = JSON.parse(query.headers)
    else
      headers = query.headers
  }

  let queryParams = null
  if(query?.queryParams){
    if(typeof query.queryParams === 'string')
      queryParams = JSON.parse(query.queryParams)
    else
      queryParams = query.queryParams
  }

  let SQLQuery: null | {queryId: string; query: string | null} = null
  if(query?.queryId){
    SQLQuery = {
      queryId: query.queryId,
      query: query?.query ?? null,
    }
  }
  
  let uri: string | null = null
  if(query?.uri)
    uri = query.uri
  
  else
    uri = null

  let queryBody: string | null = null
  if(query?.body)
    queryBody = query.body

  let requestBodyType: HTTPRequestBodyTypes | null = null
  if(query?.requestBodyType)
    requestBodyType = query.requestBodyType
  
  const returnObject = {
    meta: {
      engine: query.engine,
      hubId: query.hubId,
      label: query.label,
    },
    config: {
      command: query.command,
      context: queryContext,
      source: {
        sourceId: query.sourceId || null,
        engine: query.engine,
      },
      query: SQLQuery,
      headers: headers,
      queryParams: queryParams,
      body: queryBody,
      requestBodyType: requestBodyType ?? null,
      uri: uri,
    },
  }

  // TODO: rework this to build only the config props needed.

  return returnObject
}

export const getQueriesInHub = async (
  accountId: HubsQueries['accountId'],
  hubId: HubsQueries['hubId']):
Promise<HubsQueries[]> => {
  return await QueriesRepository.getQueriesInHub(accountId, hubId)
}

export default {
  createQuery,
  deleteQuery,
  execute,
  getQueryById,
  getQueriesInHub,
  nullifyQuerySourceId,
  updateQuery,
}
