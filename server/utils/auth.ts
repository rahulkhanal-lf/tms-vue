import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getDbPool } from '~/server/utils/db'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(userId: number): string {
  const config = useRuntimeConfig()
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number }
    return decoded
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const pool = getDbPool()
  const [rows] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [decoded.userId])
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}