import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Queries - HTTP', () => {

  it('should create a new GET Query w/out headers, params, or body.', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      hubId: jestSettings.HUB_ID, 
      label: `Test GET Query ${timestamp}`,
      sourceId: jestSettings.HTTP_SOURCE_ID,
      command: 'GET',
    }

    const result = await request(app)
      .post('/v1/queries')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    const { data } = result.body
    expect(result.status).toBe(200)

    expect(data.config.command).toBe('GET')
    expect(data.config.source).toBeTruthy()
    expect(data.config.query.query).not.toBeTruthy()
    expect(data.config.query.queryId).toBeTruthy()
    expect(data.config.headers).not.toBeTruthy()
    expect(data.config.body).not.toBeTruthy()
  })

  it('should create a new GET Query w/out headers, params, or body.', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      hubId: jestSettings.HUB_ID, 
      label: `Test GET Query ${timestamp}`,
      sourceId: jestSettings.HTTP_SOURCE_ID,
      command: 'POST',
    }

    const result = await request(app)
      .post('/v1/queries')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    const { data } = result.body
    expect(result.status).toBe(200)

    expect(data.config.command).toBe('GET')
    expect(data.config.source).toBeTruthy()
    expect(data.config.query.query).not.toBeTruthy()
    expect(data.config.query.queryId).toBeTruthy()
    expect(data.config.headers).not.toBeTruthy()
    expect(data.config.body).not.toBeTruthy()
  })

  // it('should execute a basic GET request', async () => {
  //   const sourceId = 'lola.src.d53dpo5lmfrH-sYYXVL'
    
  //   expect(true).toBe(true)
  // })
})
