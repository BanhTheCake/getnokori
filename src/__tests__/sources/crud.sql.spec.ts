import ServerEnvironments from '@/enums/ServerEnvs.enum'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type SourceConfiguration from '@/types/sources/IConnectionSettings.interface'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Sources - SQL-Based', () => {
  let sourceId = ''
  it('should create a source', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const payload: SourceConfiguration = { 
      hubId: jestSettings.HUB_ID,
      label: `MySQL Jest ${timestamp}`,
      engine: EngineTypes.MYSQL,
      connectionSettings: {
        type: EngineTypes.MYSQL,
        host: 'cosmicdb-001.sector-four.nokori.com',
        port: 3306,
        database: 'shop_db',
        user: 'db_admin',
        password: 'phasers_to_stun',
      }, 
    }

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
    expect(result.body.data.nodeId).toBe(result.body.data.sourceId)
    sourceId = result.body.data.sourceId
  })
  
  it('should get a source', async () => {

    const result = await request(app)
      .get(`/v1/sources/${sourceId}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
    expect(result.body.data.sourceId).toBeTruthy()
    expect(result.body.data.hubId).toBe(jestSettings.HUB_ID)
    expect(result.body.data.label).toBeTruthy()
  })

  it('should get all sources in a hub', async () => {

    const result = await request(app)
      .get(`/v1/sources/?hubId=${jestSettings.HUB_ID}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
    expect(result.body.data.length).toBeGreaterThan(0)
  })

  it('should update a source', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const payload = { 
      label: `MySQL Jest ${timestamp} UPDATE`,
    }

    const result = await request(app)
      .put(`/v1/sources/${sourceId}`)
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
  })

  it('should delete a source', async () => {
    const result = await request(app)
      .delete(`/v1/sources/${sourceId}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)

  })

})
