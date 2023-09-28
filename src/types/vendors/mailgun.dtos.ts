export interface MailgunSendMailRequestDTO {
  to: string | string[]
  from: string
  bcc?: string | string[] | null
  subject: string
  text?: string | null
  html?: string | null
  cc?: string | string[] | null
  headers?: Record<string, any> | null
}
