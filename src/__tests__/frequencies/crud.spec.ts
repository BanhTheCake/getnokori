import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Frequencies - CRUD', () => {

  it('should get frequency values for an account', async () => {

    const result = await request(app)
      .get('/v1/frequencies/hubs.queryExecutions?timeStart=2023-02-01&timeEnd=2023-02-28')
      .set({
        'x-nokori-api-key': APIKey,
        'Content-Type': 'application/json',
      })
      .send()
      
    expect(result.status).toBe(200)
    expect(result.body.data).toBeTruthy()
    expect(result.body.data.length).toBeGreaterThan(0)
    expect(result.body.data[0].metric).toBe('hubs.queryExecutions')
    expect(result.body.data[0].count).toBeDefined()
    expect(result.body.data[0].date).toBeTruthy()
  })

  it('should increment a frequency metric', async () => {
    const result = await request(app)
      .put('/v1/frequencies/hubs.queryExecutions/increment')
      .set({
        'x-nokori-api-key': APIKey,
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
  })

  it('should decrement a frequency metric', async () => {
    const result = await request(app)
      .put('/v1/frequencies/hubs.queryExecutions/decrement')
      .set({
        'x-nokori-api-key': APIKey,
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
  })

})
