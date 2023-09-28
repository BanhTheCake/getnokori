interface MailTemplate {
  templateId: string
  accountId: string
  templateName: string
  subject: string
  templateDesc?: string | null
  template: string
  context?: string | object | null
  archived: boolean
  createdAt: string
  updatedAt: string
}

export default MailTemplate
