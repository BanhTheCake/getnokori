import db from '@/models/mysql'
import type MailSendsModel from '@/types/mail/MailSends.interface'

const getMailSends = async (accountId: string, from: string, to: string, offset: number = 0, limit: number = 25): Promise<MailSendsModel[] | []> => {
  const query = 'SELECT *, DATE(createdAt) as date FROM mail_sends WHERE accountId = ? AND DATE(createdAt) BETWEEN ? AND ? ORDER BY createdAt DESC LIMIT ?, ?'
  const results = await db.query(query, [accountId, from, to, offset, limit])
  return results ? results : []
}

const getMailSendsCount = async (accountId: string, from: string, to: string): Promise<number> => {
  const query = 'SELECT count(*) as count FROM mail_sends WHERE accountId = ? AND DATE(createdAt) BETWEEN ? AND ? ORDER BY createdAt'
  const result = await db.query(query, [accountId, from, to])
  return result ? result[0].count : 0
}

const getMailSend = async (accountId: string, emailId: string): Promise<MailSendsModel | null> => {
  const query = 'SELECT * FROM mail_sends WHERE accountId = ? AND emailId = ?'
  const results = await db.query(query, [accountId, emailId])
  return results ? results[0] : null
}

const saveMailSend = async (mailSend: MailSendsModel): Promise<boolean> => {
  const query = 'INSERT INTO mail_sends SET ?'
  const results = await db.query(query, [mailSend])
  return results.affectedRows > 0
}

const updateMailSend = async (accountId: string, emailId: string, obj: Partial<MailSendsModel>): Promise<boolean> => {
  const query = 'UPDATE mail_sends SET ? WHERE accountId = ? AND emailId = ?'
  const results = await db.query(query, [obj, accountId, emailId])
  return results.affectedRows > 0
}

const updateMailSendById = async (emailId: string, obj: Partial<MailSendsModel>): Promise<boolean> => {
  const query = 'UPDATE mail_sends SET ? WHERE emailId = ?'
  const results = await db.query(query, [obj, emailId])
  return results.affectedRows > 0
}

const getMailSendByVendorMailId = async (vendorMailId: string): Promise<MailSendsModel | null> => {
  const query = 'SELECT * FROM mail_sends WHERE vendorMailId = ?'
  const results = await db.query(query, [vendorMailId])
  return results ? results[0] : null
}

const getMailSendIdByVendorMailId = async (vendorMailId: string): Promise<MailSendsModel | null> => {
  const query = 'SELECT emailId FROM mail_sends WHERE vendorMailId = ?'
  const results = await db.query(query, [vendorMailId])
  return results ? results[0] : null
}

export default {
  getMailSend,
  getMailSendByVendorMailId,
  getMailSendIdByVendorMailId,
  getMailSends,
  getMailSendsCount,
  saveMailSend,
  updateMailSend,
  updateMailSendById,
}
