import { createError, readBody } from 'h3'
import { getDbPool } from '~/server/utils/db'
import { hashPassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const body = await readBody(event) as { email?: string; password?: string }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
  }

  const pool = getDbPool()

  // Check if user exists
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  if (Array.isArray(existing) && existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists' })
  }

  // Create user
  const passwordHash = hashPassword(password)
  const [result] = await pool.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash])
  const userId = (result as any).insertId

  const token = generateToken(userId)

  return { token, user: { id: userId, email } }
})