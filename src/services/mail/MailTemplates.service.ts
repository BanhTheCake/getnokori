import MailTemplatesRepo from '@/repositories/mail/MailTemplates.repo'
import type MailTemplate from '@/types/mail/MailTemplate.interface'
import Mustache from 'mustache'

const getTemplates = async (accountId: string, offset: number = 0, limit: number = 25): Promise<MailTemplate[] | []> => {
  return await MailTemplatesRepo.getTemplates(accountId, offset, limit)
}

const getTemplate = async (accountId: string, templateId: string): Promise<MailTemplate | null> => {
  return await MailTemplatesRepo.getTemplate(accountId, templateId)
}

const createTemplate = async (accountId: string, obj: Partial<MailTemplate>): Promise<boolean> => {
  return await MailTemplatesRepo.createTemplate(accountId, obj)
}

const updateTemplate = async (accountId: string, templateId: string, obj: object): Promise<boolean> => {
  return await MailTemplatesRepo.updateTemplate(accountId, templateId, obj)
}

const deleteTemplate = async (accountId: string, templateId: string): Promise<boolean> => {
  return await MailTemplatesRepo.deleteTemplate(accountId, templateId)
}

export const renderTemplate = async (template: string, context: object): Promise<{rendered: string | null; error: any | null}> => {
  try {
    const rendered = await Mustache.render(template, context)
    return { rendered, error: null }
  }
  catch (error: any) {
    logger.error('Error rendering template', {
      error: error,
      template: template,
      context: context,
    })

    return { rendered: null, error: error }
  }
  
}

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  renderTemplate,
}
