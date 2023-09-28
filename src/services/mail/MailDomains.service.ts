import MailDomainsRepo from '@/repositories/mail/MailDomains.repo'
import type MailDomainsModel from '@/types/mail/MailDomains.interface'
import { domainVerificationKey } from '@/utils/ids'
import { domainStatusCacheService } from '@/services/_cache/KVCache.service'

const getMailDomains = async (accountId: string): Promise<MailDomainsModel[] | []> => {
  return await MailDomainsRepo.getMailDomains(accountId)
}

const getMailDomain = async (accountId: string, domain: string): Promise<MailDomainsModel | null> => {
  return await MailDomainsRepo.getMailDomain(accountId, domain)
}

const createMailDomain = async (newDomain: Partial<MailDomainsModel>): Promise<{domain: string; verificationKey: string} | null> => {
  const verificationKey = domainVerificationKey()
  const domainToCreate = {
    ...newDomain,
    verificationKey,
  }
  const didCreateDomain = await MailDomainsRepo.createMailDomain(domainToCreate)
  if(didCreateDomain && domainToCreate.domain){
    return {
      domain: domainToCreate.domain,
      verificationKey,
    }
  }

  return null
}

const getUnverifiedDomains = async (): Promise<MailDomainsModel | null> => {
  return await MailDomainsRepo.getUnverifiedDomains()
}

const getVerifiedDomains = async (): Promise<MailDomainsModel | null> => {
  return await MailDomainsRepo.getVerifiedDomains()
}

const updateVerifiedAt = async (accountId: string, domain: string): Promise<boolean> => {
  return await MailDomainsRepo.updateVerifiedAt(accountId, domain)
}

const deleteDomain = async (accountId: string, domain: string): Promise<boolean> => {
  return await MailDomainsRepo.deleteDomain(accountId, domain)
}

const setDomainVerified = async (accountId: string, domain: string): Promise<boolean> => {
  domainStatusCacheService.purge(accountId, domain)
  return await MailDomainsRepo.setDomainVerified(accountId, domain)
}

const setDomainUnverified = async (accountId: string, domain: string): Promise<boolean> => {
  domainStatusCacheService.purge(accountId, domain)
  return await MailDomainsRepo.setDomainUnverified(accountId, domain)
}

export default {
  createMailDomain,
  deleteDomain,
  getMailDomain,
  getMailDomains,
  getUnverifiedDomains,
  getVerifiedDomains,
  setDomainUnverified,
  setDomainVerified,
  updateVerifiedAt,
}
