import { promisify } from 'util'
import { createPool } from 'mysql2'

const pool = createPool({
  connectionLimit: 5,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
  charset: 'utf8mb4',
  multipleStatements: true,
  dateStrings: ['DATE', 'DATETIME'],
})

if (process.env.NODE_ENV !== 'test') {
  pool.getConnection((err, connection) => {
    if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST')
        logger.error('Database connection was closed.')

      if (err.code === 'ER_CON_COUNT_ERROR')
        logger.error('Database has too many connections.')

      if (err.code === 'ECONNREFUSED')
        logger.error('Database connection was refused.')
    }
    if (connection) connection.release()
  })
}

const convertMySqlPacketsToObjects = async (results: any) => {
  if (!results.map || typeof results.map !== 'function') return results

  return results.map((result: any) => ({
    ...result,
  }))
}

export const poolAsync = {
  query(sql: string, values: any): any {
    return promisify(pool.query).call(pool, { sql, values })
  },
}

export const query = async (sql: string, values: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, resp) => {
      if (err) 
        return reject(err)
       
      resolve(resp)
    })
  })
  // const results = await promisify(pool.query).call(pool, { sql, values })
  // return await convertMySqlPacketsToObjects(results)
}

const rollback = (err) => {
  return new Promise((resolve, reject) => {
    pool.query('ROLLBACK;', [], (err, resp) => {
      if (err) {
        // Fall back to torching the connection
        pool.end()
        logger.error(err)
        return reject(err)
      }
      
      return resp
    })
  })
}

export const end = async () => {
  return await pool.end()
}

export default {
  pool: poolAsync,
  end,
  rollback,
  query,
  convertMySqlPacketsToObjects,
}
