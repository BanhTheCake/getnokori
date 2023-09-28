import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { array, boolean, mixed, number, object, string } from 'yup'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'

const schema = object().shape({
  command: object().shape({
    label: string().oneOf(['SELECT', 'INSERT', 'UPDATE', 'DELETE']).required(),
    value: string().oneOf(['select', 'insert', 'update', 'delete']).required(),
  }).required(),
  context: array().of(object().shape({
    key: string().required(),
    value: mixed().required(),
    isDefault: boolean().optional().default(false).nullable(),
  })).optional().nullable(),
  query: object().shape({
    queryId: string().required(),
    query: string().required(),
  }).required(),
  source: object().shape({
    sourceId: string().required(),
    engine: string().oneOf(Object.values(EngineTypes)).required(),
  }),
}).required()

type IDraftSQLBasedQueryRequest = InferType<typeof schema>

// parse and assert validity
const isValidIDraftSQLBasedQueryRequest = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'IDraftSQLBasedQueryRequest', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { IDraftSQLBasedQueryRequest }
export { isValidIDraftSQLBasedQueryRequest }
