import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'
import EmailService from '@/services/email'

const handleReceiveFeedback = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, message } = req.body
  if((!name || !email || !message) && !req.query.emailOnly) return res.json(APIResponse.failure('Missing required fields.'))

  const subject = req.query.emailOnly === 'true' ? 'Optin - nokori.com' : 'Contact form - nokori.com'
  try {
    await EmailService.sendRaw({
      to: 'wes@nokori.com',
      subject,
      from: 'help@nokori.com',
      text: `${email} - ${message}`,
    })
  }
  catch(error: any) {
    logger.error('Failed to send email.', error)
  }

  res.json(APIResponse.success())
  next()
}

export default {
  handleReceiveFeedback,
}
