import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { array, boolean, mixed, number, object, string } from 'yup'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import SQLCommands from '@/enums/queries/SQLCommands.enum'
import HTTPMethods from '@/enums/queries/HTTPQueryMethods.enum'
import HTTPRequestBodyTypes from '@/enums/queries/HTTPRequestBodyTypes.enum'

const schema = object().shape({
  meta: object().shape({
    engine: mixed().oneOf(Object.values(EngineTypes)).optional(),
    label: string().optional().nullable(),
    hubId: string().required(),
  }),
  config: object().shape({
    command: string().oneOf([...Object.values(SQLCommands), ...Object.values(HTTPMethods)]).required(),
    context: array().of(object().shape({
      key: string().required(),
      value: mixed().required(),
      isDefault: boolean().optional().default(false).nullable(),
    })).nullable(),
    query: object().shape({
      queryId: string().required(),
      query: string().nullable().optional(),
    }).nullable().optional(),
    headers: array().of(object().shape({
      key: string().required(),
      value: mixed().required(),
      isDefault: boolean().optional().default(false).nullable(),
    })).nullable().optional(),
    pathParams: array().of(object().shape({
      key: string().required(),
      value: mixed().required(),
      isDefault: boolean().optional().default(false).nullable(),
    })).nullable().optional(),
    queryParams: array().of(object().shape({
      key: string().required(),
      value: mixed().required(),
      isDefault: boolean().optional().default(false).nullable(),
    })).nullable().optional(),
    body: mixed().nullable().optional(),
    requestBodyType: string().oneOf([...Object.values(HTTPRequestBodyTypes)]).nullable().optional(),
    source: object().shape({
      sourceId: string().nullable(),
      engine: string().oneOf(Object.values(EngineTypes)),
    }).required(),
    uri: string().optional().nullable(),
  }),
}).required()

type INokoriDBQuery = InferType<typeof schema>

// parse and assert validity
const isValidINokoriDBQuery = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = schema.cast(context)
    await schema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'INokoriDBQuery', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

export { INokoriDBQuery }
export { isValidINokoriDBQuery }
