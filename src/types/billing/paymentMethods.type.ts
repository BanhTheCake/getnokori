import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { boolean, number, object, string } from 'yup'

const schema = object().shape({
  accountId: string().required(),
  methodId: string().nullable().optional(),
  isDefault: boolean().default(false),
  expired: boolean().default(false),
  providerMethodId: string().nullable().optional(),
  type: string().nullable().optional(),
  object: string().nullable().optional(),
  billing_details__address__city: string().nullable().optional(),
  billing_details__address__country: string().nullable().optional(),
  billing_details__address__line1: string().nullable().optional(),
  billing_details__address__line2: string().nullable().optional(),
  billing_details__address__postal_code: string().nullable().optional(),
  billing_details__address__state: string().nullable().optional().length(2),
  billing_details__email: string().nullable().optional(),
  billing_details__name: string().nullable().optional(),
  billing_details__phone: string().nullable().optional().length(18),
  card__brand: string().nullable().optional(),
  card__country: string().nullable().optional(),
  card__exp_month: string().nullable().optional().length(2),
  card__exp_year: string().nullable().optional().length(4),
  card__funding: string().nullable().optional(),
  card__generated_from: string().nullable().optional(),
  card__last4: string().nullable().optional(),
  created: number().nullable().optional(),
  customer: string().nullable().optional(),
  livemode: boolean().nullable().optional(),
  createdAt: string().nullable().optional(),
  updatedAt: string().nullable().optional(),
}).required()

type IPaymentMethods = InferType<typeof schema>

// parse and assert validity
const isValidIPaymentMethods = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'IPaymentMethods', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { IPaymentMethods }
export { isValidIPaymentMethods }
