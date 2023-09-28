import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import MailTemplateService from '@/services/mail/MailTemplates.service'
import SuccessfulRenderResult from '../fixtures/email/SuccessfulRenderResult'

const APIKey = 'lola_pk_test_TAKPkYzqUdhu3gg-weJe0P2hm8Jcg2RPXXkg'

describe('MailTemplateService', () => {

  it('It should render the email template', async () => {

    const html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><meta http-equiv="Content-Type" content="text/html charset=UTF-8" /><html lang="en"><head></head><body><p>Hi, {{name}}!</p></body></html>'
    const context = {
      name: 'Alan',
    }

    const renderedResult = await MailTemplateService.renderTemplate(html, context)

    expect(renderedResult.rendered).toBeTruthy()
    expect(renderedResult.rendered).toEqual(SuccessfulRenderResult)
    expect(renderedResult.error).toBeFalsy()
  })
})
