
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
import { enrichTemplate } from '@/utils/stringTemplates'

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

interface Param {
  key: string
  value: string
}

import type { IQueryRunner } from '@/types/queries/IQueryRunner.interface'
import type HubsSources from '@/types/sources/hubsSources.interface'

export default class HTTPBasedRunner implements IQueryRunner {
  protected queryDefinition: INokoriDBQuery['config']
  protected accountId: string

  constructor(accountId: string, queryDefinition: INokoriDBQuery['config']){
    this.queryDefinition = queryDefinition
    this.accountId = accountId
  }

  async run(): Promise<{ data: any; error: any | null }> {

    if(!this.queryDefinition?.query?.queryId){
      logger.error('Query ID is required', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Query ID is required' }
    }

    if(!this.queryDefinition?.source?.sourceId){
      logger.error('Source ID is required', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Source ID is required' }
    }
    const queryId = this.queryDefinition.query.queryId
    const sourceId = this.queryDefinition.source.sourceId
    const sourceSettings: HubsSources | null = await SourcesService.getSource(this.accountId, sourceId)

    if(!sourceSettings){
      logger.error('Source not found', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Source not found' }
    }

    const connectionSettings = sourceSettings.connectionSettings
    if(!connectionSettings){
      logger.error('Connection settings not found', {
        accountId: this.accountId,
        sourceId: sourceId,
        connectionSettings: connectionSettings,
      })
      return { data: null, error: 'Connection settings not found' }
    }

    const parsedSettings = JSON.parse(connectionSettings)
    const url = parsedSettings.host
    if(!url){
      logger.error('URL is required', {
        accountId: this.accountId,
        sourceId: sourceId,
        connectionSettings: connectionSettings,
      })
      return { data: null, error: 'URL is required' }
    }

    let compiledQueryDefinition: INokoriDBQuery['config'] = this.queryDefinition
    let finalQueryContext: any = null
    if(this.queryDefinition.context && this.queryDefinition.context){
      if(Array.isArray(this.queryDefinition.context))
        finalQueryContext = ContextBuilder.mapContext(this.queryDefinition.context)
      else
        finalQueryContext = this.queryDefinition.context
  
      const renderQueryResult = await ContextBuilder.renderObject(finalQueryContext, this.queryDefinition)
      if(renderQueryResult)
        compiledQueryDefinition = renderQueryResult
    }

    const {
      command,
      headers,
      queryParams,
      pathParams,
      body,
      uri,
    } = compiledQueryDefinition

    const mappedQueryParams: Record<string, any> = {}
    // if(queryParams)
    //   mappedQueryParams = Object.fromEntries(queryParams.map(({ key, value }) => [key, value]))

    const axiosConfig: AxiosRequestConfig = {
      method: command as any,
      url: `${url}/${uri}`,
    }

    if(headers){
      headers.forEach(({ key, value }) => {
        if(!axiosConfig.headers) axiosConfig.headers = {}
        axiosConfig.headers[key] = value
      })
    }

    if(body)
      axiosConfig.data = body

    try {
      const response: AxiosResponse = await axios(axiosConfig)

      ClientLogsService.info({ queryId, request: compiledQueryDefinition })
      return { data: response.data, error: null }
    }
    catch (error: any) {
      const axiosError: AxiosError = error
      let finalError = error

      if(axiosError.response)
        finalError = axiosError.response.data

      ClientLogsService.error({ queryId, request: compiledQueryDefinition, response: finalError })
      return { data: null, error: finalError }
    }
  }

}
