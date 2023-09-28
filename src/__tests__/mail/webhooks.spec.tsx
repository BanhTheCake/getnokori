import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import request from 'supertest'
import app from '@/app'
import deliveredEvent from '../fixtures/vendors/mailgun/event.delivered'
import permFailEvent from '../fixtures/vendors/mailgun/event.permFail'
import tempFailEvent from '../fixtures/vendors/mailgun/event.tempFail'

describe('Mail - Send', () => {
  it('should process a delivered status email webhook', async () => {

    const response = await request(app)
      .post('/v1/mail/vendors/mailgun/webhooks')
      .set({ 
        'Content-Type': 'application/json',
      })
      .send(deliveredEvent)

    expect(response.status).toBe(200)
  })

  it('should process a tempFail status email webhook', async () => {

    const response = await request(app)
      .post('/v1/mail/vendors/mailgun/webhooks')
      .set({ 
        'Content-Type': 'application/json',
      })
      .send(tempFailEvent)

    expect(response.status).toBe(200)
  })

  it('should process a permFail status email webhook', async () => {

    const response = await request(app)
      .post('/v1/mail/vendors/mailgun/webhooks')
      .set({ 
        'Content-Type': 'application/json',
      })
      .send(permFailEvent)

    expect(response.status).toBe(200)
  })
})
