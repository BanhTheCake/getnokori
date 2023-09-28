import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Hubs tests', () => {

  it('should get all hubs for the account', async () => {
    const result = await request(app)
      .get('/v1/hubs')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
    expect(result.body.data.length).toBeGreaterThan(0)
  })

  it('should create a hub', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      label: `Jest Hub ${timestamp}`,
    }
    const result = await request(app)
      .post('/v1/hubs')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    expect(result.status).toBe(200)
    expect(result.body.data.hubId).toBeTruthy()
    expect(result.body.data.archived).toBe(0)
    expect(result.body.data.label).toBe(apiRequest.label)
  })

  it('should update a hub', async () => {
    const timestamp = new Date().toISOString().split('.').shift()
    const apiRequest = {
      label: `Jest Hub Update ${timestamp}`,
    }
    const result = await request(app)
      .put(`/v1/hubs/${'lola.hub.UTxx3Gw0h9CZpkHzqZa'}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    expect(result.status).toBe(200)
  })
  
})
