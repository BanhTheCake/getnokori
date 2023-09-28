import { paramCase } from 'param-case'

export const dasherize = (str: string) => paramCase(str)

export const collapseArrayOfStrings = (arr: string[]) => arr.join('\n')

export const getDomainFromEmail = (email) => {
  // Extract email address if it's in the format "Name <email>"
  const match = email.match(/(?:.*<\s*(\S+@\S+\.\S+)\s*>)|(\S+@\S+\.\S+)/)
  if (!match) {
    logger.error('Could not extract email from string', email)
    return null
    
  }
  
  const extractedEmail = match[1] ? match[1] : match[2]

  // Extract the domain from the email address
  const domain = extractedEmail.split('@')[1]
  if (!domain) {
    logger.error('Could not extract domain from email', extractedEmail)
    return null
  }
  
  return domain
}

export default {
  dasherize,
}
