import { createError, readBody } from 'h3'
import type { ExecuteValues } from 'mysql2/promise'
import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const pool = getDbPool()
  const method = event.req.method
  const id = Number(event.context.params?.id)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task id' })
  }

  if (method === 'PATCH') {
    const body = await readBody(event) as Record<string, unknown>
    const updates: string[] = []
    const values: ExecuteValues = []

    if (typeof body.title === 'string') {
      const trimmed = body.title.trim()
      if (!trimmed) {
        throw createError({ statusCode: 400, statusMessage: 'Task title cannot be empty' })
      }
      updates.push('title = ?')
      values.push(trimmed)
    }

    if (typeof body.priority === 'string') {
      updates.push('priority = ?')
      values.push(body.priority)
    }

    if (typeof body.completed === 'boolean') {
      updates.push('completed = ?')
      values.push(body.completed ? 1 : 0)
    }

    if (updates.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No task fields to update' })
    }

    values.push(id)
    await pool.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values)

    const [rows] = await pool.query(
      'SELECT id, title, completed, priority, created_at, sort_order FROM tasks WHERE id = ?',
      [id]
    )

    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  }

  if (method === 'DELETE') {
    await pool.execute('DELETE FROM tasks WHERE id = ?', [id])
    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
