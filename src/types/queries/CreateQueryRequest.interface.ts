
import type SchemaValidationResponse from '@/types/schemas/SchemaValidationResponse.interface'
import type { InferType } from 'yup'
import { array, boolean, mixed, number, object, string } from 'yup'
import HTTPMethods from '@/enums/queries/HTTPQueryMethods.enum'
import SQLCommands from '@/enums/queries/SQLCommands.enum'

const CreateSqlQuerySchema = object().shape({
  hubId: string().required(),
  label: string().optional().nullable(),
  sourceId: string().optional().nullable(),
  command: string().oneOf(Object.values(SQLCommands)).required(),
  query: string().required(),
})

export type ICreateSQLBasedQuery = InferType<typeof CreateSqlQuerySchema>

// parse and assert validity
export const isValidICreateSQLBasedQuery = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = CreateSqlQuerySchema.cast(context)
    await CreateSqlQuerySchema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'ICreateSQLBasedQuery', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

/**
 * HTTP Based Queries
 */
const CreateHTTPQuerySchema = object().shape({
  hubId: string().required(),
  label: string().optional().nullable(),
  sourceId: string().optional().nullable(),
  command: string().oneOf(Object.values(HTTPMethods)).required(),
  body: mixed().optional().nullable(),
  headers: array().of(object().shape({
    key: string().required(),
    value: string().required(),
  })).optional().nullable(),
  params: array().of(object().shape({
    key: string().required(),
    value: string().required(),
  })).optional().nullable(),
  uri: string().required(),
})

export type ICreateHTTPBasedQuery = InferType<typeof CreateHTTPQuerySchema>

// parse and assert validity
export const isValidICreateHTTPBasedQuery = async (
  context: object | null,
): Promise<SchemaValidationResponse> => {
  try {
    const castContext = CreateHTTPQuerySchema.cast(context)
    await CreateHTTPQuerySchema.validate(castContext, { strict: true })
  }
  catch (error: any) {
    logger.error('Validation error', { 
      error, 
      schema: 'ICreateHTTPBasedQuery', 
    })
    return { isValid: null, errors: error.errors }
  }

  return { isValid: true, errors: null }
}

// export { INokoriDBQuery }
// export { isValidINokoriDBQuery }
