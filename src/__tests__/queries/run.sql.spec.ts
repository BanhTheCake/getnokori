import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Queries - SQL - Runners', () => {
  it('Should execute a basic SQL query', async () => {
    const apiRequest = {
      queryId: jestSettings.QUERY_SELECT_NOW,
    }
    
    const result = await request(app)
      .post('/v1/queries/execute')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    expect(result.status).toBe(200)
    expect(result.body).toHaveProperty('data')
    expect(result.body.data).toBeTruthy()
  })
})
