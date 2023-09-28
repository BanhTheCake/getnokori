import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { array, boolean, mixed, number, object, string } from 'yup'

const schema = object().shape({
  userId: string().required(),
  accountId: string().required(),
  platformAccountId: string().required(),
  active: boolean().default(true),
  firstName: string().nullable().optional(),
  lastName: string().nullable().optional(),
  email: string().required(),
  avatarURI: string().nullable().optional(),
  password: string().nullable().optional(),
  salt: string().nullable().optional(),
  hasPassword: boolean().default(false).optional(),
  address__streetAddress: mixed().nullable().optional(),
  address__streetAddressExt: mixed().nullable().optional(),
  address__locality: mixed().nullable().optional(),
  address__region: mixed().nullable().optional(),
  address__postalCode: mixed().nullable().optional(),
  address__country: mixed().nullable().optional(),
  address: object().shape({
    streetAddress: mixed().nullable().optional(),
    streetAddressExt: mixed().nullable().optional(),
    locality: mixed().nullable().optional(),
    region: mixed().nullable().optional(),
    postalCode: mixed().nullable().optional(),
    country: mixed().nullable().optional(),
  }).optional(),
  verified: boolean().default(false).optional(),
  accountType: string().nullable().optional(),
  subAccountType: string().nullable().optional(),
  createdAt: string().nullable().optional(),
  updatedAt: string().nullable().optional(),
  lastLoggedInAt: string().nullable().optional(),
  ipAddress: string().nullable().optional(),
}).required()

type IUserModel = InferType<typeof schema>

// parse and assert validity
const isValidIUserModel = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'IUserModel', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { IUserModel }
export { isValidIUserModel }

const userTokenSchema = schema.concat(object().shape({
  exp: number().required(),
  iat: number().required(),
}))

// export type IUserToken = InferType<typeof userTokenSchema>

export type IUserToken = IUserModel & {
  exp: number
  iat: any
}
