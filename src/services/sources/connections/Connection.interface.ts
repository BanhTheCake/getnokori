interface ConnectionInterface {
  ready?: any

  getConnection(): Promise<{result: true | null; error: any}>

  getConnectionPool?(): Promise<{result: true | null; error: any}>

  closeConnectionSync?(): Promise<boolish>

  closeConnection?(): void | null

  query(query: string, context?: any): Promise<{results: any | null; error: any | null}>

  getSchemas(): Promise<any | null>

  getSchemaEntities<T>(schema: T ): Promise<any | null>

  getEntityFields<T>(tableName: T): Promise<any | null> 

  end?(): Promise<any | null>
}

export default ConnectionInterface
