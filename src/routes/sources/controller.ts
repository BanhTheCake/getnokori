import type { NextFunction, Request, Response } from 'express'
import SourcesService from '@/services/sources/sources.service'
import { failure, success } from '@/utils/apiResponse'
import HubService from '@/services/hubs/'
import HubsContentsService from '@/services/hubs/contents'
import type HubsSources from '@/types/sources/hubsSources.interface'
import HubNodeTypes from '@/enums/hubs/nodeTypes.enum'
import QueryService from '@/services/queries'

import type SourcesInterface from '@/types/sources/hubsSources.interface'

const getSources = async (req: Request, res: Response, next: NextFunction) => {
  const hubId = req.query.hubId as string || null
  const accountId = req.user.platformAccountId as string || null
  if(!accountId || !hubId) {
    return res.status(400).json({
      error: 'Missing required query parameters',
    })
  }

  const sources = await SourcesService.getSources(accountId, hubId)
  if(!sources)
    return res.status(200).json(success([]))
  
  const outputSources = sources.map((source) => {
    const { connectionSettings, ...rest } = source
    const parsedSettings = JSON.parse(connectionSettings)
    // if(parsedSettings.user)
    //   parsedSettings.user = parsedSettings.user.substring(0, 3) + parsedSettings.user.substring(3).replace(/./g, '*')
    
    // if(parsedSettings.password)
    //   parsedSettings.password = parsedSettings.password.substring(0, 3) + parsedSettings.password.substring(3).replace(/./g, '*')

    return {
      ...rest,
      connectionSettings: parsedSettings,
    }
  })

  res.status(200).json(success(outputSources)) 
}

const handleCreateSource = async (req: Request, res: Response, next: NextFunction) => {

  const source = req.body || null
  if(!source) {
    return res.status(400).json({
      error: 'Missing required body parameters',
    })
  }

  const accountId = req.user.platformAccountId as string || null
  if(!accountId) return res.status(400).json(failure('Missing required accountId parameters'))

  if(!source.hubId) {
    return res.status(400).json({
      error: 'HubId is required',
    })
  }

  const hubExists = await HubService.getHub(accountId, source.hubId)
  if(!hubExists) return res.status(400).json(failure('Hub does not exist'))

  if(!source.hubId) {
    return res.status(400).json({
      error: 'HubId is required',
    })
  }

  if(!source.label){
    return res.status(400).json({
      error: 'Label is required',
    })
  }

  if(!source.engine){
    return res.status(400).json({
      error: 'Engine is required',
    })
  }

  if(!source.connectionSettings){
    return res.status(400).json({
      error: 'Connection settings are required',
    })
  }

  source['accountId'] = accountId

  const { parentNodeId, ...sourceToCreate }: { parentNodeId: string } & SourcesInterface = source

  const sourcesParentNodeId = await HubsContentsService.getSourceRootNode(accountId, source.hubId)
  
  if(!sourcesParentNodeId?.nodeId) return res.status(400).json(failure('Sources node id not found'))

  const didCreateSource = await SourcesService.createSource(sourceToCreate, sourcesParentNodeId.nodeId)
  if(!didCreateSource) 
    return res.status(500).json(failure('Error creating source'))

  didCreateSource.source.nodeType = HubNodeTypes.SOURCE
  didCreateSource.source.parentNodeId = source.parentNodeId

  delete didCreateSource.source.accountId

  return res.status(200).json(success(didCreateSource.source))

}

const getSourceById = async (req: Request, res: Response, next: NextFunction) => {

  const sourceId = req.params.sourceId as string || null
  if(!sourceId) return res.status(400).json(failure('Missing required sourceId parameters'))
  
  const accountId = req.user.platformAccountId as string || null
  if(!accountId) return res.status(400).json(failure('Missing required accountId parameters'))

  const source: Partial<HubsSources> | null = await SourcesService.getSource(accountId, sourceId)
  if(!source) return res.status(400).json(failure('Source not found'))

  if(source.connectionSettings) source.connectionSettings = JSON.parse(source.connectionSettings)
  source.nodeType = HubNodeTypes.SOURCE

  // if(source.connectionSettings) {
  //   const parsedSettings = source.connectionSettings as any

  //   if(parsedSettings.user)
  //     parsedSettings.user = parsedSettings.user.substring(0, 3) + parsedSettings.user.substring(3).replace(/./g, '*')
    
  //   if(parsedSettings.password)
  //     parsedSettings.password = parsedSettings.password.substring(0, 3) + parsedSettings.password.substring(3).replace(/./g, '*')
      
  //   source.connectionSettings = parsedSettings
  // }

  return res.status(200).json(success(source))
}

const handleUpdateSource = async (req: Request, res: Response, next: NextFunction) => {
  const sourceId = req.params.sourceId as string || null
  if(!sourceId) return res.status(400).json(failure('Missing required sourceId parameters'))
  
  const accountId = req.user.platformAccountId as string || null
  if(!accountId) return res.status(400).json(failure('Missing required accountId parameters'))

  const source = req.body || null
  if(!source) return res.status(400).json(failure('Missing required body parameters'))

  if(source.connectionSettings) source.connectionSettings = JSON.stringify(source.connectionSettings)

  const didUpdateSource = await SourcesService.updateSource(accountId, sourceId, source)
  if(!didUpdateSource) return res.status(500).json(failure('Error updating source'))

  const updatedSource = await SourcesService.getSource(accountId, sourceId)

  return res.status(200).json(success(updatedSource))
}

const handleDeleteSource = async (req: Request, res: Response, next: NextFunction) => {
  const sourceId = req.params.sourceId as string || null
  if(!sourceId) return res.status(400).json(failure('Missing required sourceId parameters'))
  
  const accountId = req.user.platformAccountId as string || null
  if(!accountId) return res.status(400).json(failure('Missing required accountId parameters'))

  const didDeleteSource = await SourcesService.deleteSource(accountId, sourceId)
  if(!didDeleteSource) return res.status(500).json(failure('Error deleting source'))

  try {
    await QueryService.nullifyQuerySourceId(accountId, sourceId)
  }
  catch (error) {
    logger.error('Error nullifying query sourceId: ', { sourceId, error })
    return res.status(500).json(failure('Error nullifying query sourceId'))
  }

  return res.status(200).json(success(didDeleteSource))
}

const getSourceSchemas = async (req: Request, res: Response, next: NextFunction) => {
  const hubId = req.params.hubId as string || null
  const sourceId = req.params.sourceId as string || null
  const accountId = req.user.platformAccountId as string || null

  logger.info({ hubId, sourceId, accountId })

  if(!sourceId || !accountId || !hubId) {
    return res.status(400).json({
      error: 'Missing required query parameters',
    })
  }

  const source = await SourcesService.getSource(accountId, sourceId)
  const connection = await SourcesService.getConnectionSettings(accountId, sourceId)

  if(!source || !connection) {
    return res.status(400).json({
      error: 'Invalid source or connection settings',
    })
  }

  const schemas = await SourcesService.getSchemas(source, connection)
  if(!schemas) 
    return null

  return res.status(200).json(success(schemas))
}

const getSourceSchema = async (req: Request, res: Response, next: NextFunction) => {
  const hubId = req.params.hubId as string || null
  const sourceId = req.params.sourceId as string || null
  const accountId = req.user.platformAccountId as string || null
  const schemaId = req.params.schemaId as string || null
  const includeTypes = req.query.includeTypes as string || null

  if(!sourceId || !accountId || !schemaId || !hubId) {
    return res.status(400).json({
      error: 'Missing required query parameters',
    })
  }

  const source = await SourcesService.getSource(accountId, sourceId)
  const connection = await SourcesService.getConnectionSettings(accountId, sourceId)

  if(!source || !connection) {
    return res.status(400).json({
      error: 'Invalid source or connection settings',
    })
  }

  const schemaEntities = await SourcesService.getSchemaEntities(source, connection, schemaId, !!includeTypes)
  if(!schemaEntities) 
    return null

  return res.status(200).json(success(schemaEntities))
}

const getSchemaEntities = async (req: Request, res: Response, next: NextFunction) => {

  res.status(200).json(success([]))
  
}

const getSourcesCatalog = async (req: Request, res: Response, next: NextFunction) => {
  const catalog = [
    {
      id: 'lola.dbt.http',
      name: 'HTTP',
      category: 'http',
      engine: 'http',
      description:
        'Connect any HTTP-based API as a data source.',
      // website: 'https://www.mysql.com/',
      // websiteAnchorText: 'mysql.com',
      docsURL: 'https://docs.nokori.com/guides/sources/http',
      buttonText: 'Configure Source',
      logo: 'https://cdn.nokori.com/images/sources/catalog/http-source-logo.png',
      isConfigurable: true,
      isHostable: false,
    },
    {
      id: 'lola.dbt.mysql',
      name: 'MySQL',
      category: 'sql-based',
      engine: 'mysql',
      description:
        'The world\’s most widely used and adopted open-source SQL database.',
      website: 'https://www.mysql.com/',
      websiteAnchorText: 'mysql.com',
      docsURL: 'https://dev.mysql.com/doc/refman/8.0/en/',
      buttonText: 'Configure Source',
      logo: 'https://cdn.nokori.com/images/sources/catalog/MySQL-Logo.png',
      isConfigurable: true,
      isHostable: false,
    },
    {
      id: 'lola.dbt.mariadb',
      name: 'MariaDB',
      category: 'sql-based',
      engine: 'mariadb',
      description:
        'Forked from MySQL, enjoy better clustering, faster in-memory reads, and non-corporate ethos.',
      website: 'https://mariadb.org/',
      websiteAnchorText: 'mariadb.org',
      docsURL: 'https://mariadb.org/documentation/',
      buttonText: 'Configure Source',
      logo: 'https://cdn.nokori.com/images/sources/catalog/maria-db.png',
      isConfigurable: true,
      isHostable: false,
    },
    {
      id: 'lola.dbt.postgres',
      name: 'PostGres',
      category: 'sql-based',
      engine: 'postgres',
      description:
        'The widely adopted MySQL alternative that swears its obviously better choice.',
      website: 'https://www.postgresql.org/',
      websiteAnchorText: 'postgresql.org',
      docsURL: 'https://www.postgresql.org/docs/',
      buttonText: 'Configure Source',
      logo: 'https://cdn.nokori.com/images/sources/catalog/postgres.png',
      isConfigurable: true,
      isHostable: false,
    },
  ]

  return res.status(200).json(success(catalog))
}

const handleValidateSource = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId as string || null
  if(!accountId) return res.status(400).json(failure('Missing required accountId parameters'))

  const requestBody = req.body || null
  if(!requestBody) return res.status(400).json(failure('Missing required request body'))

  if(!requestBody.engine) return res.status(400).json(failure('Missing body.engine parameter'))
  if(!requestBody.connectionSettings) return res.status(400).json(failure('Missing body.connectionSettings parameter'))

  const { result, error } = await SourcesService.testConnection(requestBody)
  if(result && !error)
    return res.status(200).json(success(true))

  logger.error('Error establishing connection', { error })
  return res.status(400).json(failure('Connection failure', { ...error }))
  
}

export default {
  getSchemaEntities,
  getSourceById,
  getSourceSchema,
  getSourceSchemas,
  getSources,
  getSourcesCatalog,
  handleCreateSource,
  handleDeleteSource,
  handleUpdateSource,
  handleValidateSource,
}
