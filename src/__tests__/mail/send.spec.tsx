import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import request from 'supertest'
import app from '@/app'

const APIKey = 'lola_pk_test_TAKPkYzqUdhu3gg-weJe0P2hm8Jcg2RPXXkg'

describe('Mail - Send', () => {

  it('should fail because no to address is specified', async () => {
    const response = await request(app)
      .post('/v1/mail/send')
      .set({ 'x-nokori-api-key': APIKey })
      .send({
        to: 'wes+jest@nokori.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<h1>This is a test email</h1>',
      })

    expect(response.status).toBe(500)
  })

  it('should fail because no template is provided and no subject', async () => {
    const response = await request(app)
      .post('/v1/mail/send')
      .set({ 'x-nokori-api-key': APIKey })
      .send({
        to: 'wes+jest@nokori.com',
        text: 'This is a test email',
        html: '<h1>This is a test email</h1>',
      })

    expect(response.status).toBe(500)
  })

  it('should send an email', async () => {
    const response = await request(app)
      .post('/v1/mail/send')
      .set({ 'x-nokori-api-key': APIKey })
      .send({
        to: 'wes+jest@nokori.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<h1>This is a test email</h1>',
        headers: {
          'X-Test-Header': 'test',
          'X-Test-Header-2': 'test-2',
        },
        context: {
          test: 'test',
        },
      })

    // console.log(response.data)
    expect(response.status).toBe(200)
  })

  // It should send by template id
})
