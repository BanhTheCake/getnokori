import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Queries - CRUD', () => {

  it('should create a new query shell with only label', async () => {
    
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      hubId: jestSettings.HUB_ID,
      label: `Test Query ${timestamp}`,
    }

    const result = await request(app)
      .post('/v1/queries')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    expect(result.status).toBe(200)
    expect(result.body.data.parentNodeId).not.toBe(apiRequest.hubId)
    expect(result.body.data.config.query.queryId).toBeTruthy()
    
  })

  it('should create a new query shell with sourceId specified', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      hubId: jestSettings.HUB_ID,
      label: `Test Query ${timestamp}`,
      sourceId: jestSettings.SOURCE_ID,
    }

    const result = await request(app)
      .post('/v1/queries')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    const query = result.body.data

    expect(result.status).toBe(200)
    expect(query.parentNodeId).not.toBe(apiRequest.hubId)
    expect(query.config.source.sourceId).not.toBe(null)
    expect(query.config.source.engine).toBeTruthy()
    expect(query.config.query.queryId).toBeTruthy()
  })

  // it('should create a new query shell with sourceId && command specified', async () => {
  //   const timestamp = new Date().toISOString().split('.').shift()
  //   const apiRequest = {
  //     hubId: jestSettings.HUB_ID,
  //     label: `Test Query ${timestamp}`,
  //     sourceId: jestSettings.SOURCE_ID,
  //     command: 'select',
  //   }

  //   const result = await request(app)
  //     .post('/v1/queries')
  //     .set({
  //       'x-nokori-api-key': APIKey,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     })
  //     .send(apiRequest)

  //   const query = result.body.data

  //   expect(result.status).toBe(200)
  //   expect(query.parentNodeId).not.toBe(apiRequest.hubId)
  //   expect(query.config.source.sourceId).not.toBe(null)
  //   expect(query.config.source.engine).toBeTruthy()
  //   expect(query.config.command).toBe('SELECT')
  // })

  // it('should create a new query shell with sourceId, command, & query specified', async () => {
  //   const timestamp = new Date().toISOString().split('.').shift()
  //   const apiRequest = {
  //     hubId: jestSettings.HUB_ID,
  //     label: `Test Query ${timestamp}`,
  //     sourceId: jestSettings.SOURCE_ID,
  //     command: 'select',
  //     query: 'SELECT NOW() as now',
  //   }

  //   const result = await request(app)
  //     .post('/v1/queries')
  //     .set({
  //       'x-nokori-api-key': APIKey,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     })
  //     .send(apiRequest)

  //   const query = result.body.data
  //   expect(result.status).toBe(200)
  //   expect(query.parentNodeId).not.toBe(apiRequest.hubId)
  //   expect(query.config.source.sourceId).not.toBe(null)
  //   expect(query.config.source.engine).toBeTruthy()
  //   expect(query.config.query.queryId).toBeTruthy()
  //   expect(query.config.command).toBe('SELECT')
  //   expect(query.config.query.query).toBe('SELECT NOW() as now')
  // })

  // it('should fail if a new query shell with query specified but no source id', async () => {
  //   const timestamp = new Date().toISOString().split('.').shift()
  //   const apiRequest = {
  //     hubId: jestSettings.HUB_ID,
  //     label: `Test Query ${timestamp}`,
  //     query: 'SELECT NOW() as now',
  //   }

  //   const result = await request(app)
  //     .post('/v1/queries')
  //     .set({
  //       'x-nokori-api-key': APIKey,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     })
  //     .send(apiRequest)

  //   expect(result.status).not.toBe(200)
  // })

  // it('should fail if sourceId is not specified but command is specified', async () => {
  //   const timestamp = new Date().toISOString().split('.').shift()
  //   const apiRequest = {
  //     hubId: jestSettings.HUB_ID,
  //     label: `Test Query ${timestamp}`,
  //     command: 'select',
  //   }

  //   const result = await request(app)
  //     .post('/v1/queries')
  //     .set({
  //       'x-nokori-api-key': APIKey,
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     })
  //     .send(apiRequest)

  //   expect(result.status).not.toBe(200)
  // })

})
