import MailSendsRepo from '@/repositories/mail/MailSends.repo'
import type MailSendsModel from '@/types/mail/MailSends.interface'
import { emailId } from '@/utils/ids'
import { mapHeaders, send } from '../vendors/mailgun.vendor.service'
import type { SendMailRequestDTO } from '@/types/mail/MailDTOs.interface'
import MailSettingsService from './MailSettings.service'
import MailSettingsEnum from '@/enums/mail/MailSettings.enum'
import { domainStatusCacheService } from '../_cache/KVCache.service'
import MailTemplatesService from './MailTemplates.service'
import type { MailgunSendMailRequestDTO } from '@/types/vendors/mailgun.dtos'
import { getDomainFromEmail } from '@/utils/strings'
import UserVerifyService from '@/services/auth/userVerify.service'
import MailScenarios from '@/enums/mail/MailScenarios.enum'
import UsersService from '@/services/auth/users.service'
import PassResetService from '@/services/auth/passReset.service'
import MailContextVars from '@/enums/mail/MailContextVars.enum'

const getMailSends = async (accountId: string, from: string, to: string, offset: number = 0, limit: number = 25): Promise<MailSendsModel[] | []> => {
  return await MailSendsRepo.getMailSends(accountId, from, to, offset, limit)
}

const getMailSendsCount = async (accountId: string, from: string, to: string): Promise<number> => {
  return await MailSendsRepo.getMailSendsCount(accountId, from, to)
}

const getMailSend = async (accountId: string, emailId: string): Promise<MailSendsModel | null> => {
  return await MailSendsRepo.getMailSend(accountId, emailId)
}

const saveMailSend = async (mailSend: Omit<MailSendsModel, 'emailId'>): Promise<{emailId: string} | null> => {

  const id = emailId()
  const { accountId, ...rest } = mailSend

  if(!accountId)
    return null

  const record = {
    emailId: id,
    accountId,
    ...rest,
  } satisfies MailSendsModel

  const createdMailSend = await MailSendsRepo.saveMailSend(record)
  if(!createdMailSend)
    return null
  
  return { emailId: id }
}

export const sendMail = async (accountId: string, args: SendMailRequestDTO): Promise<{result: any | null; error: any | null}> => {

  const {
    settings,
    scenario = null,
    templateId,
    headers = {},
    context = {},
    test = false,
  } = args

  if(!settings)
    return { result: null, error: 'Settings are required' }

  const {
    to,
    from,
    bcc,
    cc,
    replyTo,
    subject,
    text,
    html,
  } = settings

  if(!templateId)
    return { result: null, error: 'Template ID is required' }

  /**
   * Scenario Logic
   * 
   * -- Verify Email: Generates a verification token and adds it to the context
   * -- Password Reset: Generates a password reset token and adds it to the context
   */
  if(scenario){
    if(!Object.values(MailScenarios).includes(scenario))
      return { result: null, error: `Invalid scenario. Must be one of [${Object.values(MailScenarios).join(', ')}]` }
      
    const userProfile = await UsersService.getUserByEmail(accountId, settings.to)
    if(!userProfile) {
      logger.warn('User profile not found for email.', { accountId, email: settings.to })
      return { result: null, error: `User not found for email ${settings.to}` }
    }

    if(!userProfile.active){
      logger.warn('User profile is not active for email send.', { accountId, email: settings.to })
      return { result: null, error: 'User is not active.' }
    }

    if(scenario === MailScenarios.VERIFY_EMAIL){
      const verifyToken = await UserVerifyService.generate(userProfile.userId, accountId)
      if(!verifyToken?.token) {
        logger.error('Failed to generate verify token.', { accountId, email: settings.to })
        return { result: null, error: 'Failed to generate verification token' }
      }
     
      context[MailContextVars.VERIFY_TOKEN] = verifyToken.token
    }

    if(scenario === MailScenarios.RESET_PASSWORD){
      console.log('reset password')
      const passResetToken = await PassResetService.generate(userProfile.userId, accountId)
      if(!passResetToken?.token) {
        logger.error('Failed to generate pass reset token.', { accountId, email: settings.to })
        return { result: null, error: 'Failed to generate pass reset token' }
      }

      context[MailContextVars.PASS_RESET_TOKEN] = passResetToken.token
    }
  }

  let finalFrom: string | null = from || null
  let finalSubject: string | null = subject || null
  let finalContext: { [key: string]: any } = typeof context === 'string' ? JSON.parse(context) : context || {}

  // If no 'to' address, return an error
  if(!to) return { result: null, error: 'To address is required' }

  // If no 'from' address, attempt to get default 'from' address from account

  if(!from){
    const defaultFrom = await MailSettingsService.getSettingByKey(accountId, MailSettingsEnum.EMAIL_DEFAULT_FROM)
    if(!defaultFrom)
      return { result: null, error: 'From address is required' }
    
    finalFrom = defaultFrom
  }

  if(!finalFrom) return { result: null, error: 'From address is required' }

  const sendingDomain = getDomainFromEmail(finalFrom)
  if(!sendingDomain) return { result: null, error: 'From address is invalid' }

  const domainStatus = await domainStatusCacheService.get(accountId, sendingDomain)
  if(!domainStatus) return { result: null, error: 'Domain sending status could not be determined.' }

  if(domainStatus !== 'verified' && !test) return { result: null, error: 'Domain is not verified' }

  // If no 'subject' and template is not provided, return an error
  if(!subject && !templateId) return { result: null, error: 'Subject is required' }

  // If 'templateId' then ignore 'text' and 'html'. Fetch and use template
  let unrenderedHTML: string | null = null
  if(templateId){
    const fetchTemplateResult = await MailTemplatesService.getTemplate(accountId, templateId)
    if(!fetchTemplateResult) return { result: null, error: 'Template does not exist' }

    unrenderedHTML = fetchTemplateResult.template

    if(fetchTemplateResult.subject && !subject)
      finalSubject = fetchTemplateResult.subject

    if(test)
      finalContext = typeof fetchTemplateResult.context === 'string' ? JSON.parse(fetchTemplateResult.context) : fetchTemplateResult.context || {}
    
  }

  // If context, render the subject line
  if(finalContext && finalSubject){
    const renderSubjectResult = await MailTemplatesService.renderTemplate(finalSubject, finalContext)
    if(renderSubjectResult.error)
      return { result: null, error: renderSubjectResult.error }

    finalSubject = renderSubjectResult.rendered || null
  }

  if(!finalSubject) return { result: null, error: 'Subject is required' }

  /**
   * Handle HTML rendering
   */
  if(!unrenderedHTML && html) 
    unrenderedHTML = html

  let renderedHTML: string | null = unrenderedHTML
  if(unrenderedHTML && finalContext){
    const renderHTMLResult = await MailTemplatesService.renderTemplate(unrenderedHTML, finalContext)
    if(renderHTMLResult.error)
      return { result: null, error: renderHTMLResult.error }

    renderedHTML = renderHTMLResult.rendered
  }

  let mappedHeaders: Record<string, any> | null = {}
  if(headers){

    if(replyTo)
      headers['Reply-To'] = replyTo

    const mapHeadersResult = mapHeaders(headers)
    mappedHeaders = mapHeadersResult
  }
  
  const sendRequest: MailgunSendMailRequestDTO = {
    to,
    from: finalFrom,
    bcc,
    cc,
    subject: finalSubject,
    text,
    html: renderedHTML,
    headers: mappedHeaders,
  }

  try {
    const { parsedMailId, status } = await send(sendRequest)

    const mailSendToSave = {
      accountId: accountId,
      vendorMailId: parsedMailId,
      status: 'queued',
      statusCode: status,
      to: to,
      cc: cc || null,
      bcc: bcc || null,
      from: finalFrom,
      subject: finalSubject,
      templateId: templateId || null,
      text: text || null,
      html: renderedHTML || null,
      context: context ? JSON.stringify(context) : null,
      headers: headers ? JSON.stringify(headers) : null,
    } satisfies Omit<MailSendsModel, 'emailId'>

    const savedMailSend = await saveMailSend(mailSendToSave)
    if(savedMailSend){
      return {
        result: { 
          emailId: savedMailSend.emailId,
          status: 'queued',
        },
        error: null,
      }
    }
  }
  catch (error: any) {
    logger.error('Error in sending email or saving mail send', error)
    return { result: null, error: error.message }
  }

  return { result: null, error: 'Failed to send email' }
}

const updateMailSend = async (accountId: string, emailId: string, obj: Partial<MailSendsModel>): Promise<boolean> => {
  return await MailSendsRepo.updateMailSend(accountId, emailId, obj)
}

const updateMailSendById = async (emailId: string, obj: Partial<MailSendsModel>): Promise<boolean> => {
  return await MailSendsRepo.updateMailSendById(emailId, obj)
}

const getMailSendByVendorMailId = async (vendorMailId: string): Promise<MailSendsModel | null> => {
  return await MailSendsRepo.getMailSendByVendorMailId(vendorMailId)
}

const getMailSendIdByVendorMailId = async (vendorMailId: string): Promise<MailSendsModel | null> => {
  return await MailSendsRepo.getMailSendIdByVendorMailId(vendorMailId)
}

export default {
  getMailSend,
  getMailSendByVendorMailId,
  getMailSendIdByVendorMailId,
  getMailSends,
  getMailSendsCount,
  saveMailSend,
  sendMail,
  updateMailSend,
  updateMailSendById,
}
