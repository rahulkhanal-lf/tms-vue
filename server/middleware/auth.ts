import { createError } from 'h3'
import { getUserFromToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Only run auth middleware on API routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Skip auth middleware for login and register routes
  if (event.path === '/api/auth/login' || event.path === '/api/auth/register') {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.substring(7)
  const user = await getUserFromToken(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.user = user
})