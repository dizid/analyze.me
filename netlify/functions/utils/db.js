import { neon } from '@neondatabase/serverless'

let sql

export function getDb() {
  if (!sql) {
    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    sql = neon(DATABASE_URL)
  }
  return sql
}
