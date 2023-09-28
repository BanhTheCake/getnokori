import formData from 'form-data'
import Mailgun from 'mailgun.js'
const mailgun = new Mailgun(formData)

const MailgunDomain = 'm.nokori.com'
const MailgunApiKey = '665815ded510faa16aca73e625112ecf-6b161b0a-8075d499'
const MailgunFromAddress = 'Team nokori <hello@nokori.com>'

const send = async ({ to = '', bcc = 'wes@nokori.com', from = MailgunFromAddress, subject, template, text = '', variables = {} }) => {

  const mg = mailgun.client({
    username: 'api',
    key: MailgunApiKey,
  })

  const data = {
    from,
    to,
    bcc,
    subject,
    template,
    text,
    // (!text && ...({'t:text': 'yes'})),
    'h:X-Mailgun-Variables': JSON.stringify(variables),
  }

  return await mg.messages.create(MailgunDomain, data)
}

const sendRaw = async ({ to = '', bcc = '', from = MailgunFromAddress, subject, text = '' }) => {

  const mg = mailgun.client({
    username: 'api',
    key: MailgunApiKey,
  })

  const data = {
    from,
    to,
    bcc,
    subject,
    text,
    // (!text && ...({'t:text': 'yes'})),
  }
 
  return await mg.messages.create(MailgunDomain, data)
}

export default {
  send,
  sendRaw,
}
