import type ConnectionInterface from '@/services/sources/connections/Connection.interface'
import { sqlTypeToTsType } from '@/services/sources/typeMappers/mysqlFieldMapper.service'
import type EntityDefinitionDto from '@/interfaces/dtos/mysql/entityDefinition.dto'
import { parseSQLEnums } from '@/utils/parsers'
import mysql from 'mysql2'
import type { Connection } from 'mysql2'

class MySqlConnection implements ConnectionInterface {
  private connection: Connection | null = null
  public ready: any
  public schema: any

  connectionOptions: any

  constructor(options: any) {
    this.connectionOptions = options
  }

  async getConnection(): Promise<{result: true | null; error: any}> {
    try {
      const result = await new Promise((resolve, reject) => {
        const connection = mysql.createConnection(this.connectionOptions)

        connection.connect((err) => {
          if (err) 
            reject(err)
          
          else 
            resolve(connection) 
          
        })
      }) as Connection
      
      if(result)
        this.connection = result
      
      return { result: true, error: null }
    }
    catch (error: any) {
      logger.error('Error establishing connection to MySQL database', { error })
      return { result: null, error: { message: error.message, code: error.code } }
    }
  }

  closeConnection() {
    if(this.connection) this.connection.end()
  }

  async query(query: string, context: any[] = []): Promise<{results: any | null; error: any | null}> {
    try {
      if(!this.connection) await this.getConnection()
      
      // TODO: Need a consistent way to handle failures
      const results = await new Promise((resolve, reject) => {
        if(!this.connection) return null
  
        this.connection.query(
          { 
            sql: query, 
            values: context, 
            timeout: 30000, // 30s
          }, 
          (err: any, results: any) => {
            if (err){
              if(this.connection) this.connection.destroy()
              reject(err)
            }
                
            else { 
              resolve(results) 
            }
                
          })
      })
  
      return { results, error: null }
    }
    catch (error: any) {
      logger.error('Error querying MySQL database', { error })
      return { results: null, error: { message: error.message, code: error.code } }
    }
  }

  async getSchemas(): Promise<any | null> {
    const schemas = await this._getSchemas()
    if(!schemas) return null

    return schemas
  }

  async _getSchemas(): Promise<any | null> {
    const query = 'SHOW schemas'
    const results = await this.query(query, [])
    return results ? results : null
  }

  // For MySQL "schema entities" would be the same as "tables"
  async getSchemaEntities<T>(schema: T, includeTypes: boolean = false ): Promise<any | null> {
    const entities = await this._getSchemaEntities(schema)

    if(!entities) return null

    this.schema = schema
    
    const enrichedEntities: Record<string, any> = []
    const entityNames = entities.map(item => item.TABLE_NAME)

    for(const entity of entityNames){
      const fields = await this.getEntityFields(entity)
      const mappedFields = fields.map((field) => {
        let tsType
        if(includeTypes) tsType = sqlTypeToTsType(field.DATA_TYPE.toLowerCase())

        let enumTypes: string[] = []
        if(field.DATA_TYPE === 'enum')
          enumTypes = parseSQLEnums(field.COLUMN_TYPE)

        const output: EntityDefinitionDto = {
          dataType: field.DATA_TYPE,
          defaultValue: field.COLUMN_DEFAULT,
          extra: field.EXTRA,
          fieldKey: field.COLUMN_KEY,
          fieldName: field.COLUMN_NAME,
          enumerations: enumTypes.length > 0 ? enumTypes : null,
          isNullable: field.IS_NULLABLE === 'YES' ? true : null,
          isPrimaryKey: field.COLUMN_KEY === 'PRI' ? true : null,
          tsType,
        }
        
        return output
      })

      if(!entity || !mappedFields) continue
      
      enrichedEntities.push({
        name: entity,
        fields: mappedFields,
      })
    }

    return enrichedEntities
  }

  async _getSchemaEntities<T>(schema: T ): Promise<any | null> {
    const tablesQuery = `SELECT table_name FROM information_schema.columns
                          WHERE table_schema = ?
                          GROUP BY table_name`
    const results = await this.query(tablesQuery, [schema])
    return results ? results : null
  }

  // For MySQL "entity fields" would be the same as "table fields"
  async getEntityFields<T>(tableName: T): Promise<any | null> {
    const columnsQuery = `SELECT column_name, data_type, is_nullable, column_default, column_key, column_type, extra
                          FROM information_schema.columns
                          WHERE table_name = ?
                          AND table_schema = ?`
    const results = await this.query(columnsQuery, [tableName, this.schema])

    return results ? results : null
  }
}

export default MySqlConnection
