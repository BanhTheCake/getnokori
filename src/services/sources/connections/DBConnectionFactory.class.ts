import DatabaseEngineTypes from '@/enums/sources/engines/engineTypes.enum'
import type ConnectionInterface from '@/services/sources/connections/Connection.interface'
import MariaDB from '@/services/sources/connections/Connection.MariaDB.class'
import MySql from '@/services/sources/connections/Connection.MySql.class'
import Postgres from '@/services/sources/connections/Connection.Postgres.class'

class DBConnectionFactory {
  async getInstance(type: string, options: any): Promise<ConnectionInterface | null> {
    
    switch (type) {
      case DatabaseEngineTypes.MYSQL:
        return new MySql(options)
      case DatabaseEngineTypes.MARIADB:
        return new MariaDB(options)
      case DatabaseEngineTypes.POSTGRES:
        return new Postgres(options)
      // default:
      //   throw new Error('Database type not supported')
    }

    return null
  }
}

export default DBConnectionFactory
