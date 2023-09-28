import APIStatuses from '@/enums/APIResponseStatuses.enum'
import { HTTPStatusCodes } from '@/services/http/HTTPStatusCodes.hash'

export const success = (data: any = null, message: string = APIStatuses.SUCCESS) => {
  const response = {
    status: APIStatuses.SUCCESS,
    statusCode: 200,
    statusText: HTTPStatusCodes[200],
    message,
    data,
  }

  return response
}

export const failure = (
  message: string | any[] = 'An error has occurred.',
  error: any = null,
  statusCode: number = 500,
) => {
  const response: {status: string; message: string | any[]; error?: any; statusCode: number; statusText?: string} = {
    status: APIStatuses.ERROR,
    statusCode: statusCode,
    statusText: HTTPStatusCodes[statusCode] || 'Internal Server Error',
    message,
  }

  if(error)
    response.error = error instanceof Object ? { ...error } : error 

  return response
}

export default {
  success,
  failure,
}
