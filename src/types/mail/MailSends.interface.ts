interface MailSendsModel {
  emailId: string
  accountId: string
  vendorMailId: string
  status: string
  statusCode?: number | null
  to: string
  from: string
  bcc?: string | null
  cc?: string | null
  subject: string
  templateId?: string | null
  html?: string | null
  text?: string | null
  context?: string | null
  headers?: string | null
  deliveryDetails?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export default MailSendsModel
