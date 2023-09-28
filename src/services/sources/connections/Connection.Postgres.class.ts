import type ConnectionInterface from '@/services/sources/connections/Connection.interface'
import pg from 'pg'
import type { Client, QueryResult } from 'pg'

class Postgres implements ConnectionInterface {
  public ready: any
  private connection: Client | null = null
  connectionOptions: any

  constructor(options: any) {
    this.connectionOptions = options
  }

  async getConnection(): Promise<{result: true | null; error: any}> {
    try {
      this.connection = new pg.Client({
        user: this.connectionOptions.user,
        host: this.connectionOptions.host,
        database: this.connectionOptions.database || null,
        password: this.connectionOptions.password,
        port: this.connectionOptions.port,
      }) 
       
      await this.connection.connect()

      return { result: true, error: null }
    }
    catch (error: any) {
      logger.error('Error establishing connection to PostGres database', { error })
      return { result: null, error: { message: error.message, code: error.code } }
    }
  }

  closeConnection(): void {
    if( this.connection) this.connection.end()
  }

  async query(query: string, context: any[] = []): Promise<{results: any | null; error: any | null}> {
    try {
      if(!this.connection) await this.getConnection()
      if(!this.connection) return { results: null, error: { message: 'No connection', code: 'NO_CONNECTION' } }
      // TODO: Need a consistent way to handle failures
      const results = await this.connection.query(query, context) as QueryResult
  
      this.closeConnection()
      return { results: results.rows, error: null }
    }
    catch (error: any) {
      logger.error('Error establishing connection to PostGres database', { error })
      return { results: null, error: { message: error.message, code: error.code } }
    }
  }

  async getSchemas(): Promise<any | null> {
    return null
  }

  async getSchemaEntities<T>(schema: T ): Promise<any | null> { 
    return null 
  }

  async getEntityFields<T>(tableName: T): Promise<any | null> {
    return null
  }
}

export default Postgres
