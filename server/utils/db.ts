import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

declare global {
  var __mysql_pool__: Pool | undefined
}

export function getDbPool() {
  if (globalThis.__mysql_pool__) {
    return globalThis.__mysql_pool__
  }

  const config = useRuntimeConfig()

  const pool = mysql.createPool({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 5,
    decimalNumbers: true
  })

  globalThis.__mysql_pool__ = pool
  return pool
}
