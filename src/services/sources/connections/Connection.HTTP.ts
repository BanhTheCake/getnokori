import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import axios from 'axios'

interface RequestOptions {
  url: string
  method: Method
  headers?: Record<string, string>
  queryParams?: Record<string, any>
  data?: any
  timeout?: number
}

interface SuccessfulResponse<T> {
  success: true
  data: T
  status: number
}

interface ErrorResponse {
  success: false
  message: string
  status?: number
}

type HttpResponse<T> = SuccessfulResponse<T> | ErrorResponse

class HttpClient {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create()
  }

  public async request<T>(options: RequestOptions): Promise<HttpResponse<T>> {
    const config: AxiosRequestConfig = {
      url: options.url,
      method: options.method,
      headers: options.headers,
      params: options.queryParams,
      data: options.data,
      timeout: options.timeout || 10000, // default timeout is 10 seconds
    }

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request<T>(config)
      return {
        success: true,
        data: response.data,
        status: response.status,
      }
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.message,
          status: error.response?.status,
        }
      }

      return {
        success: false,
        message: 'An unknown error occurred',
      }
    }
  }
}

export default HttpClient
