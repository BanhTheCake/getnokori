import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { number, object, string } from 'yup'

const schema = object().shape({
  planId: string(),
  planGroupId: string().nullable().optional(),
  accountId: string(),
  name: string().nullable().optional(),
  amount: number().nullable().optional(),
  frequency: string().oneOf(['monthly', 'annually']).nullable().optional(),
  createdAt: string().nullable().optional(),
  updatedat: string().nullable().optional(),
}).required()

type IBillingPlans = InferType<typeof schema>

// parse and assert validity
const isValidIBillingPlans = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'IBillingPlans', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { IBillingPlans }
export { isValidIBillingPlans }
