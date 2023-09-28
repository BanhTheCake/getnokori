import formData from 'form-data'
import Mailgun from 'mailgun.js'
const mailgun = new Mailgun(formData)
import type { MailgunMessageData, MessagesSendResult } from 'mailgun.js/interfaces/Messages'

export const parseMailId = (mailId: string): string | null=> {
  const id = mailId.match(/(?<=<).*?(?=>)/gm) 
  return id ? id[0] : null
}

const _send = async (requestParams): Promise<{result: MessagesSendResult | null; error?: any | null}> => {

  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY!,
  })

  // const data = {
  //   from,
  //   to,
  //   bcc,
  //   subject,
  //   text,
  //   // (!text && ...({'t:text': 'yes'})),
  // }

  const { headers, ...messageParams } = requestParams

  const data: MailgunMessageData = {
    ...messageParams,
    ...headers,
    'o:tracking': false,
  }

  try {
    const sendMailResult = await mg.messages.create(process.env.MAILGUN_DOMAIN!, data)
    return { result: sendMailResult }
  }
  catch (error) {
    logger.error('Mailgun: Error sending email', { error, sendData: data })
    return { result: null, error }
  }

}

export const send = async (requestParams): Promise<{parsedMailId: string; status: number}> => {
  const emailSendResult = await _send(requestParams)
  if(emailSendResult.error || !emailSendResult.result){
    logger.error('Error sending email', { ...emailSendResult?.error, ...emailSendResult?.result })
    throw new Error('Failed to send email')
  }

  const { id, message, status } = emailSendResult.result
  if(!id || !message || !status){
    logger.error('Error sending email', { ...emailSendResult?.error, ...emailSendResult?.result })
    throw new Error('Failed to send email')
  }

  if(status !== 200){
    logger.error('Mail: Received a non-200 sending status', { ...emailSendResult?.error, ...emailSendResult?.result })
    throw new Error('Failed to send email')
  }

  const parsedMailId = parseMailId(id)
  if(!parsedMailId){
    logger.error('Mail: Failed to parse mail id', { ...emailSendResult?.error, ...emailSendResult?.result, id, message, status })
    throw new Error('Failed to send email')
  }

  console.log(parsedMailId)
  return { parsedMailId, status }
}

export const mapHeaders = (headers: object): Record<string, any> | null =>{
  try {
    
    const rows = Object.entries(headers)
    return rows.reduce((acc, header)=>{
      acc[`h:${header[0]}`] = header[1]
      return acc
    }, {})
  }
  catch (error) {
    logger.error('Error mapping headers', { error })
  }

  return null
}

export default {
  send,
}
