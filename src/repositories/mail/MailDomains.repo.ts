import db from '@/models/mysql'
import type MailDomainsModel from '@/types/mail/MailDomains.interface'

const getMailDomains = async (accountId: string): Promise<MailDomainsModel[] | []> => {
  const query = 'SELECT domain, status, verificationKey, lastVerified FROM mail_domains WHERE accountId = ? AND archived = 0 ORDER BY domain ASC'
  const results = await db.query(query, [accountId])
  return results ? results : []
}

const getMailDomain = async (accountId: string, domain: string): Promise<MailDomainsModel | null> => {
  const query = 'SELECT domain, status, verificationKey, lastVerified FROM mail_domains WHERE accountId = ? AND domain = ? AND archived = 0 ORDER BY domain ASC'
  const result = await db.query(query, [accountId, domain])
  return result ? result[0] : null
}

const createMailDomain = async (newDomain: Partial<MailDomainsModel>): Promise<boolean> => {
  const query = 'INSERT INTO mail_domains SET ?'
  const result = await db.query(query, [newDomain])
  return result.affectedRows > 0
}

const getUnverifiedDomains = async (): Promise<MailDomainsModel | null> => {
  const query = `SELECT * FROM mail_domains 
  JOIN accounts ON mail_domains.accountId = accounts.accountId
  WHERE mail_domains.status = "verifying" 
  AND mail_domains.archived = 0
  AND accounts.active = 1`
  const results = await db.query(query, [])
  return results ? results : []
}

const getVerifiedDomains = async (): Promise<MailDomainsModel | null> => {
  const query = `SELECT * FROM mail_domains 
  JOIN accounts ON mail_domains.accountId = accounts.accountId
  WHERE mail_domains.status = "verified" 
  AND mail_domains.archived = 0
  AND accounts.active = 1`
  const results = await db.query(query, [])
  return results ? results : []
}

const updateVerifiedAt = async (accountId: string, domain: string): Promise<boolean> => {
  const query = 'UPDATE mail_domains SET lastVerified = CURRENT_TIMESTAMP WHERE accountId = ? AND domain = ?'
  const result = await db.query(query, [accountId, domain])
  return result.affectedRows > 0
}

const deleteDomain = async (accountId: string, domain: string): Promise<boolean> => {
  const query = 'UPDATE mail_domains SET archived = 1 WHERE accountId = ? AND domain = ?'
  const result = await db.query(query, [accountId, domain])
  return result.affectedRows > 0
}

const setDomainVerified = async (accountId: string, domain: string): Promise<boolean> => {
  const query = 'UPDATE mail_domains SET status = "verified", lastVerified = CURRENT_TIMESTAMP WHERE accountId = ? AND domain = ? AND archived = 0'
  const result = await db.query(query, [accountId, domain])
  return result.affectedRows > 0
}

const setDomainUnverified = async (accountId: string, domain: string): Promise<boolean> => {
  const query = 'UPDATE mail_domains SET status = "verifying", lastVerified = CURRENT_TIMESTAMP WHERE accountId = ? AND domain = ? AND archived = 0'
  const result = await db.query(query, [accountId, domain])
  return result.affectedRows > 0
}

export const getDomainStatus = async (accountId: string, domain: string): Promise<string | null> => {
  const query = 'SELECT status FROM mail_domains WHERE accountId = ? AND domain = ? AND archived = 0'
  const result = await db.query(query, [accountId, domain])
  console.log(result, accountId, domain)
  return result.length > 0 ? result[0].status : null
}

export default {
  createMailDomain,
  deleteDomain,
  getDomainStatus,
  getMailDomain,
  getMailDomains,
  getUnverifiedDomains,
  getVerifiedDomains,
  setDomainVerified,
  setDomainUnverified,
  updateVerifiedAt,
}
