import ClientLogsRepo from '@/repositories/logs/ClientLogs.repo'
import { logId } from '@/utils/ids'

enum StatusCodes {
  OK = 200,
  ERROR = 500,
}

const error = async({ queryId, request, response }): Promise<void> => {

  const statusCode= StatusCodes.ERROR
  await save({ statusCode, queryId, request: JSON.stringify(request), response: JSON.stringify(response) })
}

const info = async ({ queryId, request }): Promise<void> => {
  const statusCode = StatusCodes.OK
  await save({ statusCode, queryId, request: JSON.stringify(request), response: null })
}

async function save({ statusCode = 200, queryId, request, response }): Promise<void> {
  const docId = logId()
  await ClientLogsRepo.create({ statusCode, logId: docId, queryId, request, response })
}

const getQueryLogs = async (queryId: string, offset: number = 0, limit: number = 25) => {
  return await ClientLogsRepo.getQueryLogs(queryId, offset, limit)
}

const getQueryLog = async (logId: string): Promise<any | null> => {
  return await ClientLogsRepo.getQueryLog(logId)
}

export default {
  error,
  info,
  getQueryLogs,
  getQueryLog,
}
