/**
 * Job: Re-Verify DNS
 * 
 * Purpose: Checks periodically that verified domains are still properly configured.
 */

import ServerEnvironments from '../../src/enums/ServerEnvs.enum'

process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'
import dns from 'node:dns'
import MailService from '../../src/services/mail/MailDomains.service'

(async () => {
  const globalVars: any = global
  /** Init global logger */

  console.log('ReVerifyDNS: Job started')

  const dnsPromises = dns.promises

  const verifieds = await MailService.getVerifiedDomains()
  if(!verifieds){
    console.log('ReVerifyDNS: No domains found')
    process.exit()
  }

  for(const verified of verifieds){
    const { domain, verificationKey, accountId } = verified
    const resolvedTxt = await dnsPromises.resolveTxt(domain)

    if(!resolvedTxt?.length){
      console.log('ReVerifyDNS: No TXT records found', { domain, accountId })
      await MailService.updateVerifiedAt(verified.accountId, domain)
      continue
    }
  
    let didFindVerified = false
    for(const record of resolvedTxt){
      const txt = record.pop()
      if(txt?.includes('nokori-domain-validation')){
        const [_, code] = txt.split('=')

        if(code !== verificationKey){
          console.log('ReVerifyDNS: Mail verification codes do not match', { domain, accountId, code, verificationKey })
          await MailService.setDomainUnverified(verified.accountId, domain)
          continue
        }

        didFindVerified = true
        await MailService.updateVerifiedAt(verified.accountId, domain)
      }
    }

    if(!didFindVerified){
      console.log('ReVerifyDNS: Setting domain as unverified', { domain, accountId, verificationKey })
      await MailService.setDomainUnverified(verified.accountId, domain)
    }
  }

  process.exit()
})()
