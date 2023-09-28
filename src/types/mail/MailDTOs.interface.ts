import type MailScenarios from '@/enums/mail/MailScenarios.enum'

export interface SendMailRequestDTO {
  templateId: string
  scenario?: MailScenarios
  settings: {
    to: string
    from?: string
    bcc?: string
    cc?: string
    replyTo?: string
    subject?: string
    text?: string
    html?: string
  }
  context?: {
    [key: string]: string
  }
  headers?: {
    [key: string]: string
  }
  test?: boolean
}
