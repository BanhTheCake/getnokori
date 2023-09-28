import type { NextFunction, Request, Response } from 'express'
import { failure, success } from '@/utils/apiResponse'
import QueriesService from '@/services/queries'
import HubNodeTypes from '@/enums/hubs/nodeTypes.enum'
import HubsService from '@/services/hubs/'
import QueryService from '@/services/queries'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type { INokoriDBQuery } from '@/types/queries/INokoriDBQuery.interface'

import { isValidIDraftBaseQueryRequest } from '@/types/queries/DraftBaseQueryExecutionRequest.interface'
import { isValidIDraftSQLBasedQueryRequest } from '@/types/queries/DraftSQLBasedQueryRequest.interface'

import { isValidINokoriDBQuery } from '@/types/queries/INokoriDBQuery.interface'
import ContextBuilder from '@/services/queries/ContextBuilder'

import ClientLogsService from '@/services/logs/ClientLogs.service'
import { removeNullishProperties } from '@/utils/objects'
import { sanitizeHeaders } from '@/utils/sanitizers'

const handleQueryExecutionRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const request = req.body
  const accountId = req.user.platformAccountId || null
  const context = req.body.context || null

  logger.info('handleQueryExecutionRequest', { accountId, ctx: context })

  if(!request) return res.status(400).json(failure('Request body is required'))
  if(!request.queryId) return res.status(400).json(failure('Query ID is required'))

  const IQuery = await QueriesService.getQueryById(accountId, request.queryId)

  if(!IQuery) return res.status(404).json(failure('Query not found'))

  // TODO: Handle when a user has specified certain context values as 'defaults'
  // Will need to check that ctx wasn't passed in request and then use the default
  // rather than overwriting here.
  IQuery.config.context = context
  const { data, error } = await QueriesService.execute(accountId, IQuery.config)
  if (error) 
    return res.status(500).json(failure(error))

  res.status(200).json(success(data))
}

const handleDraftQueryExecutionRequest = 
async (
  req: Request, 
  res: Response, 
  next: NextFunction): 
Promise<any> => {
  const ctx = req.body
  const accountId = req.user.platformAccountId || null

  logger.info('handleDraftQueryExecutionRequest', { accountId, ctx })

  if(!ctx) return res.status(400).json(failure('Request body is required'))

  if(!ctx.meta || !ctx.config) return res.status(400).json(failure('Request body is missing {meta} or {config} properties'))

  const requestHeaderIsValid = await isValidIDraftBaseQueryRequest(ctx)
  if(requestHeaderIsValid?.errors) {
    res.status(400).json(
      failure('Request body is missing required properties', 
        { 
          error: requestHeaderIsValid.errors, 
        },
      ))
    return next()
  }

  const { meta, config } = ctx
  // TODO: Refactor to be in its own service

  let requestIsValid
  switch (meta.engine) {
    case EngineTypes.MYSQL:
      requestIsValid = await isValidIDraftSQLBasedQueryRequest(config)
      break
    case EngineTypes.POSTGRES:
      requestIsValid = await isValidIDraftSQLBasedQueryRequest(config)
      break
    case EngineTypes.MARIADB:
      requestIsValid = await isValidIDraftSQLBasedQueryRequest(config)
      break
    case EngineTypes.HTTP:
      requestIsValid = await isValidINokoriDBQuery(config)
      break
      
    default:
      requestIsValid = null
      break
  }

  if(requestIsValid?.errors) {
    res.status(400).json(
      failure('Request config is invalid', 
        { 
          error: requestIsValid.errors, 
        },
      ))
    return next()
  }

  const { data, error } = await QueriesService.execute(accountId, config)
  if (error) {
    res.status(500).json(failure(error))
    return next()
  }

  res.status(200).json(success(data))
  return next()
}

/**
 * Creates a query within a hub
 * For logic flow chart, see: https://www.notion.so/loladb/Query-Create-Flow-fc6094adf186432396f8bd231c9e7a77
 *
 * @param   {Request}       req   [req description]
 * @param   {Response}      res   [res description]
 * @param   {NextFunction}  next  [next description]
 *
 * @return  {Response}              [return description]
 */
export const handleCreateQuery = async (req: Request, res: Response, next: NextFunction) => {
  // if parentNodeId not in request, parentNodeId = hubId
  
  const accountId = req.user.platformAccountId
  const requestBody = req.body || null

  if(!requestBody) return res.status(400).json(failure('Request body is required'))
  if(!requestBody.hubId) return res.status(400).json(failure('Hub ID is required'))
  const HubId = requestBody.hubId

  const hubExists = await HubsService.getHub(accountId, HubId)
  if(!hubExists) return res.status(400).json(failure('HubId does not exist'))

  if(!requestBody.label) return res.status(400).json(failure('Query label is required'))
  const label = requestBody.label

  // 1. Create the query definition
  const { data, error } = await QueriesService.createQuery(accountId, requestBody)
  if(!data?.queryId || error) return res.status(500).json(failure(error))

  const query = await QueriesService.getQueryById(accountId, data.queryId)
  if(!query){
    logger.error('Unable to get query by id after creation')
    return res.status(500).json(failure('Unable to get query by id after creation'))
  }

  // const responseObject = {
  //   hubId: HubId,
  //   nodeId: data.queryId,
  //   queryId: data.queryId,
  //   parentNodeId: requestBody.parentNodeId,
  //   nodeType: HubNodeTypes.QUERY,
  //   label: label,
  // }

  res.status(200).json(success(query))
}

const handleGetQuery = async (req: Request, res: Response, next: NextFunction) => {

  const accountId = req.user.platformAccountId
  
  const queryId = req.params.queryId
  if(!queryId) return res.status(400).json(failure('queryId is required'))

  const query: INokoriDBQuery | null = await QueryService.getQueryById(accountId, queryId)
  if(!query) return res.status(400).json(failure('Query does not exist'))

  res.status(200).json(success(query))

}

/**
 * Handles updating the query's definition
 *
 * @param   {Request}       req   [req description]
 * @param   {Response}      res   [res description]
 * @param   {NextFunction}  next  [next description]
 *
 * @return  {[type]}              [return description]
 */
const handleUpdateQuery = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const requestBody = req.body || null

  if(!requestBody) return res.status(400).json(failure('Request body is required'))
  const isValidRequest = await isValidINokoriDBQuery(requestBody)
  if(isValidRequest.errors) return res.status(400).json(failure('Request body is invalid', { error: isValidRequest.errors }))
 
  if(!requestBody.meta.hubId) return res.status(400).json(failure('Hub ID is required'))
  const HubId = requestBody.meta.hubId

  const hubExists = await HubsService.getHub(accountId, HubId)
  if(!hubExists) return res.status(400).json(failure('HubId does not exist'))

  const didUpdateQuery = await QueriesService.updateQuery(accountId, requestBody, req.params.queryId)
  if(!didUpdateQuery) return res.status(500).json(failure('Unable to update query'))

  res.status(200).json(success({}))
}

const handleDeleteQuery = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const requestBody = req.body || null

  if(!requestBody) return res.status(400).json(failure('Request body is required'))

  if(!req.params.queryId) return res.status(400).json(failure('Query ID is required'))

  try {
    const deleteResults = await Promise.allSettled([
      QueriesService.deleteQuery(accountId, req.params.queryId),
      HubsService.deleteNode(accountId, req.params.queryId),
    ])
  
    for(const result of deleteResults){
      if(result.status === 'rejected'){
        logger.error('Unable to delete query', result.reason)
        return res.status(500).json(failure('Unable to delete query'))
      }
    }
  }
  catch (error) {
    logger.error('Unable to delete query', error)
    return res.status(500).json(failure('Unable to delete query'))
  }

  return res.status(200).json(success({}))
}

const handleGetQueryLogs = async (req: Request, res: Response, next: NextFunction) => {

  const accountId = req.user.platformAccountId
  const queryId = req.params.queryId

  if(!queryId) return res.status(400).json(failure('queryId is required'))
  if(!accountId) return res.status(400).json(failure('accountId is required'))

  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 25

  const logs = await ClientLogsService.getQueryLogs(queryId, offset, limit)
  if(!logs) return res.status(200).json(success([]))
  return res.status(200).json(success(logs))
}

const handleGetQueryLog = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const queryId = req.params.queryId
  const logId = req.params.logId

  if(!logId) return res.status(400).json(failure('logId is required'))

  const log = await ClientLogsService.getQueryLog(logId)
  
  if(!log) return res.status(200).json(failure('Log not found.'))

  const { requestBodyType, ...logRequest } = log.request
  if(logRequest.headers.length > 0)
    logRequest.headers = sanitizeHeaders(logRequest.headers)
  
  log.request = JSON.stringify(removeNullishProperties(logRequest), null, 2)
  log.response = JSON.stringify(log.response, null, 2)
  
  return res.status(200).json(success(log))
}

export default {
  handleCreateQuery,
  handleDeleteQuery,
  handleGetQuery,
  handleQueryExecutionRequest,
  handleDraftQueryExecutionRequest,
  handleUpdateQuery, 
  handleGetQueryLogs,
  handleGetQueryLog,
}
