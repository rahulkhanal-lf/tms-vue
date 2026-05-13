import { createError, readBody } from 'h3'
import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'PUT') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const body = await readBody(event) as { ids?: number[] }
  if (!Array.isArray(body.ids) || body.ids.some(id => !Number.isInteger(id) || id <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task order payload' })
  }

  const pool = getDbPool()
  const ids = body.ids
  const updates = ids.map((id, index) =>
    pool.execute('UPDATE tasks SET sort_order = ? WHERE id = ?', [ids.length - index, id])
  )

  await Promise.all(updates)
  return { success: true }
})
