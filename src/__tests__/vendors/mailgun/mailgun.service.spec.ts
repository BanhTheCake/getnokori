import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import { mapHeaders, parseMailId } from '@/services/vendors/mailgun.vendor.service'

describe('MailgunService', () => {

  it('should get the mailgun mail id', async () => {
    const mailId = '<20230607220252.287ec354e685efa7@m.nokori.com>'
    const parsed = parseMailId(mailId)

    expect(parsed).toBe('20230607220252.287ec354e685efa7@m.nokori.com')
  })

  it('should map headers to mailgun format', async () => {
    const headers = {
      'x-custom-header': 'custom value',
      'x-custom-header2': 'custom value2',
    }
    const mapped = mapHeaders(headers)

    expect(mapped).toEqual({
      'h:x-custom-header': 'custom value',
      'h:x-custom-header2': 'custom value2',
    })
  })

})
