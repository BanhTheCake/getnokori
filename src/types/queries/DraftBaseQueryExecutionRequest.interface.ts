import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { array, boolean, mixed, number, object, string } from 'yup'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'

const schema = object().shape({
  meta: object().shape({
    engine: string().oneOf(Object.values(EngineTypes)).required(),
    hubId: string().required(),
  }).required(),
})

type IDraftBaseQueryRequest = InferType<typeof schema>

// parse and assert validity
const isValidIDraftBaseQueryRequest = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'IDraftBaseQueryRequest', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { IDraftBaseQueryRequest }
export { isValidIDraftBaseQueryRequest }
