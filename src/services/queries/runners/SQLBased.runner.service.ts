import QueriesRepository from '@/repositories/queries/index.repo'
// import ConnectionSettingsRepo from '@/repositories/hubs/sources/connectionSettings.repo'
import SourcesService from '@/services/sources/sources.service'
import DBConnectionFactory from '@/services/sources/connections/DBConnectionFactory.class'
import ConnectionUtils from '@/services/sources/utils/connection.utils'
import ContextBuilder from '@/services/queries/ContextBuilder'
import type { INokoriDBQuery } from '@/types/queries/INokoriDBQuery.interface'
import ClientLogsService from '@/services/logs/ClientLogs.service'
import TriggersService from '@/services/triggers'

import type { IQueryRunner } from '@/types/queries/IQueryRunner.interface'

export default class SQLBasedRunner implements IQueryRunner {
  protected queryDefinition: INokoriDBQuery['config']
  protected accountId: string

  constructor(accountId: string, queryDefinition: INokoriDBQuery['config']){
    this.queryDefinition = queryDefinition
    this.accountId = accountId
  }

  async run(): Promise<{ data: any; error: string | null }> {
    if(!this.queryDefinition?.query?.queryId){
      logger.error('Query ID is required', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Query ID is required' }
    }
  
    if(!this.queryDefinition?.query?.query){
      logger.error('Query is required', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Query is required' }
    }
  
    if(!this.queryDefinition?.source?.sourceId){
      logger.error('Source ID is required', {
        accountId: this.accountId,
        queryDefinition: this.queryDefinition,
      })
      return { data: null, error: 'Source ID is required' }
    }
  
    const queryId = this.queryDefinition.query.queryId
    const queryContext = this.queryDefinition.context as INokoriDBQuery['config']['context'] || null
    const sourceId: string = this.queryDefinition.source.sourceId
  
    // 1. Get the connection settings
    const sourceSettings = await SourcesService.getSource(this.accountId, sourceId)
    // TODO: put account number and query id in log, but only send query id back to public
    if(!sourceSettings){
      logger.error('Sources Connection settings not found for queryId', {
        accountId: this.accountId,
        queryId,
      })
      return { data: null, error: 'Query is not assigned to valid source.' }
    }
  
    if(!sourceSettings.connectionSettings){
      logger.error('Source definition does not have valid connection settings.', {
        sourceId,
        queryId,
      })
      return { data: null, error: 'Source definition does not have valid connection settings.' }
    }
  
    if(!sourceSettings.engine){
      logger.error('Source definition does not have a valid engine assigned.', {
        accountId: this.accountId,
        queryId,
      })
      return { data: null, error: 'Source definition does not have a valid engine assigned.' }
    }
  
    const triggers = await TriggersService.getTriggersByObjectId(this.accountId, queryId)
  
    // 2. Instantiate our connection handler
    const parsedConnectionSettings = JSON.parse(sourceSettings.connectionSettings)
    
    const DBConnectionInstance = await new DBConnectionFactory().getInstance(sourceSettings.engine, parsedConnectionSettings)
    if(!DBConnectionInstance){
      logger.error('Failed to instantiate DB connection', { sourceId: sourceSettings.sourceId })
      return { data: null, error: 'Failed to instantiate DB connection' }
    }
    
    const { result: DBConnection, error } = await DBConnectionInstance.getConnection()
    if(error){
      logger.error('Failed to connect to DB', { sourceId: sourceSettings.sourceId })
      return { data: null, error: error }
    }
    // 3. Execute the query
  
    // TODO: Need to check what templating method they're using. If 'pdo' we expect an array. If mustache or 
    // some such then we need to expect an object.
    // TODO: What if context is just an array of values? Probably need to force key<string>: value<array>
    try {
      let finalQuery = this.queryDefinition.query.query
      let finalQueryContext
      if(this.queryDefinition.context && this.queryDefinition.context){
        if(Array.isArray(queryContext))
          finalQueryContext = ContextBuilder.mapContext(queryContext)
        else
          finalQueryContext = queryContext
  
        const renderQueryResult = await ContextBuilder.renderContext(finalQueryContext, this.queryDefinition.query.query)
        if(renderQueryResult)
          finalQuery = renderQueryResult
      }
  
      const { results, error } = await DBConnectionInstance.query(finalQuery)
      if(error){
        ClientLogsService.error({ queryId, request: this.queryDefinition, response: error })
        return { data: [], error: error }
      }
  
      // TODO: Refactor all occurrences of these two lines to a global helper method
      await ConnectionUtils.closeConnection(DBConnectionInstance)
  
      ClientLogsService.info({ queryId, request: this.queryDefinition })
  
      // Handle Triggers
      if(triggers){
        for(const trigger of triggers){
          if(trigger.type === 'onQuerySuccess')
            await TriggersService.executeTrigger(finalQueryContext, trigger)
        }
      }
  
      // Handle Triggers End
      return { data: results, error: null }
      
    }
    catch (error: any) {
      logger.error(error)
      ClientLogsService.error({ queryId, request: this.queryDefinition, response: error })
      return { data: null, error }
    }
  }
}
