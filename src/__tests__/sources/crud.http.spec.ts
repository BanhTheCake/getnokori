import ServerEnvironments from '@/enums/ServerEnvs.enum'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type SourceConfiguration from '@/types/sources/IConnectionSettings.interface'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Sources - HTTP-Based', () => {
  let sourceId = ''
  it('should create a based GET source', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const payload: SourceConfiguration = { 
      hubId: jestSettings.HUB_ID,
      label: `HTTP JEST - GET - ${timestamp}`,
      engine: EngineTypes.HTTP,
      connectionSettings: {
        type: EngineTypes.HTTP,
        url: 'https://www.toptal.com/developers/postbin/1678973555326-8379073389805',
        headers: {},
      }, 
    } satisfies SourceConfiguration

    const result = await request(app)
      .post('/v1/sources')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(payload)

    expect(result.status).toBe(200)
    expect(result.body.data.sourceId).toBeTruthy()
    expect(result.body.data.hubId).toBe(jestSettings.HUB_ID)
    expect(result.body.data.label).toBeTruthy()
    expect(result.body.data.engine).toBeTruthy()
    expect(result.body.data.nodeId).toBe(result.body.data.sourceId)
    sourceId = result.body.data.sourceId
  })
})
