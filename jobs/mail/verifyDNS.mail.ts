/**
 * Job: Verify DNS
 * 
 * Purpose: To verify that the DNS records for a domain are properly configured.
 */

import ServerEnvironments from '../../src/enums/ServerEnvs.enum'

process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'
import dns from 'node:dns'
import MailService from '../../src/services/mail/MailDomains.service'

(async () => {
  console.log('VerifyDNS: Job started')

  const dnsPromises = dns.promises

  const unverifieds = await MailService.getUnverifiedDomains()
  if(!unverifieds){
    console.log('VerifyDNS: No domains found')
    process.exit()
  }

  for(const unverified of unverifieds){
    const { domain, verificationKey, accountId } = unverified
    const resolvedTxt = await dnsPromises.resolveTxt(domain)

    if(!resolvedTxt?.length){
      console.log('VerifyDNS: No TXT records found', { domain, accountId })
      await MailService.updateVerifiedAt(unverified.accountId, domain)
      continue
    }
  
    let didFindVerified = false
    for(const record of resolvedTxt){
      const txt = record.pop()
      if(txt?.includes('nokori-domain-validation')){
        const [_, code] = txt.split('=')

        if(code !== verificationKey){
          console.log('VerifyDNS: Mail verification codes do not match', { domain, accountId, code, verificationKey })
          await MailService.updateVerifiedAt(unverified.accountId, domain)
          continue
        }

        console.log('VerifyDNS: Setting domain as verified', { domain, accountId, code, verificationKey })
        await MailService.setDomainVerified(unverified.accountId, domain)
        didFindVerified = true
      }
    }

    if(!didFindVerified)
      await MailService.updateVerifiedAt(unverified.accountId, domain)
  }

  process.exit()
})()
