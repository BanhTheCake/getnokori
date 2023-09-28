import type HTTPMethods from '@/enums/queries/HTTPQueryMethods.enum'
import type SQLCommands from '@/enums/queries/SQLCommands.enum'

type QueryOperationTypes = HTTPMethods | SQLCommands

export default QueryOperationTypes
