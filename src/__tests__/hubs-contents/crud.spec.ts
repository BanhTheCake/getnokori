import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import app from '@/app'
import request from 'supertest'

const APIKey = jestSettings.API_KEY

describe('Hubs Contents', () => {

  it('should get all hubs content for a hub id', async () => {
    const url = `/v1/hubs/${jestSettings.HUB_ID}/contents`

    const result = await request(app)
      .get(url)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(result.status).toBe(200)
    expect(result.body.data.children.length).toBeGreaterThan(0)
  })
})
