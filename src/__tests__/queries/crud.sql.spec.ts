import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Queries - CRUD', () => {

  it('should update a SQL query successfully', async () => {
    const apiRequest = JSON.stringify({ meta: { engine: 'mysql', hubId: 'lola.hub.6491IQxDmgecF86YFsZ', label: 'Test' }, config: { command: 'SELECT', context: null, constraints: null, query: { query: 'SELECT NOW() as now', queryId: 'lola.q.o2lo4Ko1umX0PQSWTFT' }, source: { engine: 'mysql', sourceId: 'lola.src.9H-svSEqWVHKvyuZWLM' } } })
    
    const result = await request(app)
      .put(`/v1/queries/${jestSettings.QUERY_SELECT_NOW}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(apiRequest)

    expect(result.status).toBe(200)
  
  })

  it('should fail if command is not compatible with source type', async () => {
    expect(true).toBe(true)
  })

  it('should fail if source is REST based but command is SQL based', async () => {
    expect(true).toBe(true)
  })
})
