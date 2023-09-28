import type { NextFunction, Request, Response } from 'express'
import { failure, success } from '@/utils/apiResponse'
import MailTemplatesService from '@/services/mail/MailTemplates.service'
import type { SendMailRequestDTO } from '@/types/mail/MailDTOs.interface'
import { mapHeaders, parseMailId, send } from '@/services/vendors/mailgun.vendor.service'
import { getSettingByKey } from '@/services/accounts/accountsSettings.service'
import AccountSettingsEnum from '@/enums/accounts/accountSettings.enum'
import type { MailgunSendMailRequestDTO } from '@/types/vendors/mailgun.dtos'
import { MailgunMailEventSeverities, MailgunMailEvents } from '@/enums/vendors/mailgun/MailEvents.enum'
import MailSendsService, { sendMail } from '@/services/mail/MailSends.service'
import type MailSendsModel from '@/types/mail/MailSends.interface'
import FrequenciesService from '@/services/frequencies'
import BaseMetrics, { MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'
import { emptyTrend, subtractDays } from '@/utils/dates'
import MailSendsStatsService from '@/services/mail/MailSendsStats.service'
import type MailTemplate from '@/types/mail/MailTemplate.interface'
import MailDomainsService from '@/services/mail/MailDomains.service'
import MailSettingsService from '@/services/mail/MailSettings.service'
import MailSettingsEnum from '@/enums/mail/MailSettings.enum'
import { domainStatusCacheService } from '@/services/_cache/KVCache.service'

const handleSendMail = async (req: Request, res: Response, next: NextFunction) => {

  /**
   Pseudo code:
   - If no 'to' address, return an error
   - If no 'from' address, attempt to get default 'from' address from account
   - - If no default 'from' address, return error.

   - If no 'subject', return an error
   - If 'templateId' then ignore 'text' and 'html' and use template
   - - If no 'templateId' then use 'text' and 'html' to send email
   - - If no 'text' or 'html' then return an error
   
   - If 'context' then use it to render the template or html
   - If 'headers' then use a MailGun vendor service to map it to their h:header=value format
   - Once completed, attempt to send the email via the Mailgun vendor service
   - - If successful, return a success response after captureing the Mailgun message id
    - - If unsuccessful, return an error response
   */
  const accountId = req.user.platformAccountId
  // if(!accountId)
  //   return res.status(500).json(failure('Account ID is required'))

  try {
    const mailSendResult = await sendMail(accountId, req.body as SendMailRequestDTO)
    if(mailSendResult.result)
      res.status(200).json(success(mailSendResult.result))
    
    else if(mailSendResult.error)
      res.status(500).json(failure(mailSendResult.error))
    
  }
  catch (error) {
    logger.error('Error in sending email or saving mail send', error)
  }

  FrequenciesService.increment(accountId, `${BaseMetrics.USAGE}.${MetricsLevel2.EMAIL}.${MetricsLevel3.SENDS}`, 1)

  return true
}

const handleGetSentMail = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  if(!accountId) return res.status(500).json(failure('Account ID is required'))

  const currentDate = new Date().toISOString().split('T')[0]
  const from = ( req.query.from || subtractDays(currentDate, 7) ) as string
  const to = ( req.query.to || currentDate ) as string
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 25

  const mailSends = await MailSendsService.getMailSends(accountId, from, to, offset, limit)
  const mailSendsCount = await MailSendsService.getMailSendsCount(accountId, from, to)

  const mappedMailSends = mailSends.map((mailSend) => {
    return {
      emailId: mailSend.emailId,
      status: mailSend.status,
      recipientEmail: mailSend.to,
      subject: mailSend.subject,
      date: mailSend.date,
      createdAt: mailSend.createdAt,
    }
  })

  const result = {
    count: mailSendsCount,
    rows: mappedMailSends,
  }

  return res.status(200).json(success(result))
}

const handleGetSentMailSingle = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  if(!accountId) return res.status(500).json(failure('Account ID is required'))

  const emailId = req.params.emailId
  if(!emailId) return res.status(400).json(failure('Email ID is required'))

  const mailSend = await MailSendsService.getMailSend(accountId, emailId)
  if(!mailSend)
    return res.status(404).json(failure('Email not found'))

  const { vendorMailId, ...cleanedMailSend } = mailSend
  return res.status(200).json(success(cleanedMailSend))
}

const handleGetTemplates = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 25

  const templates = await MailTemplatesService.getTemplates(accountId, offset, limit)
  if(!templates) return res.status(500).json(failure('Failed to get templates'))

  return res.status(200).json(success(templates))
}

const handleGetTemplate = async (req: Request, res: Response, next: NextFunction) => {

  const accountId = req.user.platformAccountId
  const templateId = req.params.templateId
  if(!templateId) return res.status(400).json(failure('Template ID is required'))

  const template = await MailTemplatesService.getTemplate(accountId, templateId)
  if(!template) return res.status(500).json(failure('Failed to get template'))

  return res.status(200).json(success(template))
}

const handleCreateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  if(!accountId) return res.status(500).json(failure('Account ID is required'))

  const body = req.body

  const templateToSave: Partial<MailTemplate> = {
    templateId: body.templateId,
    templateName: body.templateName,
    subject: body.subject,
    template: body.template,
    context: body.context,
  }

  try {
    const savedTemplate = await MailTemplatesService.createTemplate(accountId, templateToSave)
    if(savedTemplate)
      return res.status(200).json(success({ templateId: body.templateId }))
    
  }
  catch (error: any) {
    logger.error('Error creating email template', error)
    if(error?.code === 'ER_DUP_ENTRY')
      return res.status(500).json(failure('Template ID already exists'))
    
  }

  return res.status(500).json(failure('Failed to create template'))

}
const handleUpdateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  if(!accountId) return res.status(500).json(failure('Account ID is required'))

  const templateId = req.params.templateId
  if(!templateId) return res.status(400).json(failure('Template ID is required'))

  const body = req.body

  const templateUpdates: Partial<MailTemplate> = { ...body }

  try {
    const updatedTemplate = await MailTemplatesService.updateTemplate(accountId, templateId, templateUpdates)
    if(updatedTemplate)
      return res.status(200).json(success({ templateId: body.templateId }))
  }
  catch (error: any) {
    logger.error('Exception updating email template', { error, templateUpdates, accountId, templateId })

  }

  logger.error('Error updating email template', { templateUpdates, accountId, templateId })
  return res.status(500).json(failure('Failed to update template'))
}

const handleDeleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId
  if(!accountId) return res.status(500).json(failure('Account ID is required'))

  const templateId = req.params.templateId
  if(!templateId) return res.status(400).json(failure('Template ID is required'))

  const deletedTemplate = await MailTemplatesService.deleteTemplate(accountId, templateId)
  if(!deletedTemplate) return res.status(500).json(failure('Failed to delete template'))

  return res.status(200).json(success({}))
}

const handleMailgunWebhook = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('MAILGUN WEBHOOK', req.body)
  const eventData = req.body['event-data']
  
  const event = eventData.event || null
  const message = eventData.message || null
  const recipient = eventData.recipient || null
  const severity = eventData.severity || null
  const reason = eventData.reason || null
  const timestamp = eventData.timestamp || null
  const deliveryStatus = eventData['delivery-status'] || null

  delete deliveryStatus['session-seconds']
  delete deliveryStatus['attempt-no']
  delete deliveryStatus['utf8']
  delete deliveryStatus['certificate-verified']

  deliveryStatus.recipient = recipient
  deliveryStatus.timestamp = timestamp

  const messageId = message.headers['message-id']
  if(!messageId) {
    logger.error('No message ID found in MailGun Webhook')
    return res.status(200).json(success({}))
  }

  const mailSendId = await MailSendsService.getMailSendIdByVendorMailId(messageId)
  if(!mailSendId?.emailId) {
    logger.error('No mail send found for message ID', messageId)
    return res.status(200).json(success({}))
  }

  if(event === MailgunMailEvents.FAILED){
    deliveryStatus.reason = reason
    deliveryStatus.severity = severity
  }

  const update = {
    status: event,
    deliveryDetails: JSON.stringify(deliveryStatus),
  } satisfies Partial<MailSendsModel>

  try {
    await MailSendsService.updateMailSendById(mailSendId.emailId, update)
  }
  catch (error) {
    logger.error('MailGun: Webhook: Failed to update mail send', error)
  }
  
  return res.status(200).json(success({}))
}

const handleGetSendStats = async (req: Request, res: Response, next: NextFunction) => {

  const accountId = req.user.platformAccountId
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const currentDate = new Date().toISOString().split('T')[0]
  const from = ( req.query.from || subtractDays(currentDate, 8) ) as string
  const to = ( req.query.to || subtractDays(currentDate, 1) ) as string
  const event = ( req.query.event || MailgunMailEvents.DELIVERED ) as string

  const timeseries = await emptyTrend(from, to)
  const stats = await MailSendsStatsService.getSendsStats(accountId, event, from, to)
  if(!stats)
    return res.json(success(Object.entries(timeseries)))

  for (const stat of stats) 
    timeseries[stat.date] = stat.count
    
  const mappedResponse = Object.entries(timeseries)

  return res.json(success(mappedResponse))
}

const handleGetDomains = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const domains = await MailDomainsService.getMailDomains(accountId)

  return res.json(success(domains))
}

const handleCreateDomain = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const { domain } = req.body
  if(!domain)
    return res.status(400).json(failure('Domain is required'))

  const domainToCreate = {
    accountId: accountId,
    domain: domain,
  }

  try {
    const createdDomain = await MailDomainsService.createMailDomain(domainToCreate)
    return res.json(success(createdDomain))
  }
  catch (error: any) {
    logger.error('Error creating domain', error)
    if(error?.code === 'ER_DUP_ENTRY')
      return res.status(500).json(failure('Domain already exists'))
  }

}

const handleDeleteDomain = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const { domain } = req.params
  if(!domain)
    return res.status(400).json(failure('Domain is required'))

  const deletedDomain = await MailDomainsService.deleteDomain(accountId, domain)

  return res.json(success(deletedDomain))
}

const handleGetSetting = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const settingKey = req.params.settingKey || null
  if(!settingKey)
    return res.status(400).json(failure('Setting key is required'))

  const setting = await MailSettingsService.getSettingByKey(accountId, settingKey)

  return res.json(success({ value: setting }))
}

const handleUpdateSettings = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.user.platformAccountId || null
  if(!accountId)
    return res.status(400).json(failure('Account ID is required'))

  const settings = req.body
  if(!settings)
    return res.status(400).json(failure('Settings are required'))

  console.log(settings)

  for(const { key, value } of settings){
    if(!key || !value) continue
    const updatedSettings = await MailSettingsService.setSetting(accountId, key, value)
    if(!updatedSettings)
      return res.status(500).json(failure('Failed to update settings'))
  }

  return res.status(200).json(success({}))
  
}

export default {
  handleCreateDomain,
  handleCreateTemplate,
  handleDeleteDomain,
  handleDeleteTemplate,
  handleGetDomains,
  handleGetSendStats,
  handleGetSentMail,
  handleGetSentMailSingle,
  handleGetTemplate,
  handleGetTemplates,
  handleGetSetting,
  handleUpdateSettings,
  handleMailgunWebhook, 
  handleSendMail,
  handleUpdateTemplate,
}
