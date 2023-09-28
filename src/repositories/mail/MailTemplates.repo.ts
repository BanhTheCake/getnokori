import db from '@/models/mysql'
import type MailTemplate from '@/types/mail/MailTemplate.interface'

const getTemplates = async (accountId: string, offset: number = 0, limit: number = 25): Promise<MailTemplate[] | []> => {
  const query = 'SELECT templateId, templateName, subject, templateDesc, createdAt, updatedAt FROM mail_templates WHERE accountId = ? AND archived = 0 ORDER BY templateId ASC LIMIT ?, ?'
  const results = await db.query(query, [accountId, offset, limit])
  return results ? results : []
}

const getTemplate = async (accountId: string, templateId: string): Promise<MailTemplate | null> => {
  const query = 'SELECT * FROM mail_templates WHERE accountId = ? AND templateId = ? AND archived = 0'
  const results = await db.query(query, [accountId, templateId])
  return results ? results[0] : null
}

const createTemplate = async (accountId: string, obj: Partial<MailTemplate>): Promise<boolean> => {
  const query = 'INSERT INTO mail_templates SET accountId = ?, ?'
  const result = await db.query(query, [accountId, obj])
  return result.affectedRows > 0
}

const updateTemplate = async (accountId: string, templateId: string, obj: object): Promise<boolean> => {
  const query = 'UPDATE mail_templates SET ? WHERE accountId = ? AND templateId = ?'
  const result = await db.query(query, [obj, accountId, templateId])
  return result.affectedRows > 0 
}

const deleteTemplate = async (accountId: string, templateId: string): Promise<boolean> => {
  const query = 'UPDATE mail_templates SET archived = 1 WHERE accountId = ? AND templateId = ?'
  const result = await db.query(query, [accountId, templateId])
  return result.affectedRows > 0 
}

export default {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
}
