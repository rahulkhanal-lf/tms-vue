import { createError, readBody } from 'h3'
import { getDbPool } from '~/server/utils/db'
import { verifyPassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const body = await readBody(event) as { email?: string; password?: string }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const pool = getDbPool()
  const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [email])

  if (!Array.isArray(rows) || rows.length === 0) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const user = rows[0] as { id: number; password_hash: string }
  if (!verifyPassword(password, user.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = generateToken(user.id)

  return { token, user: { id: user.id, email } }
})