import { createError, getQuery, readBody } from 'h3'
import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const pool = getDbPool()
  const method = event.req.method

  if (method === 'GET') {
    const [rows] = await pool.query(
      'SELECT id, title, completed, priority, created_at, sort_order FROM tasks ORDER BY sort_order DESC, created_at DESC'
    )
    return rows
  }

  if (method === 'POST') {
    const body = await readBody(event) as { title?: string; priority?: string }
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const priority = typeof body.priority === 'string' ? body.priority : 'medium'

    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'Task title is required' })
    }

    const [sortRows] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM tasks')
    const sortOrder = Array.isArray(sortRows) && sortRows.length > 0 ? (sortRows[0] as any).maxOrder + 1 : 1

    const [result] = await pool.execute(
      'INSERT INTO tasks (title, priority, completed, sort_order) VALUES (?, ?, 0, ?)',
      [title, priority, sortOrder]
    )

    const insertId = (result as any).insertId
    const [rows] = await pool.query('SELECT id, title, completed, priority, created_at, sort_order FROM tasks WHERE id = ?', [insertId])
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    if (query.completed === 'true') {
      await pool.execute('DELETE FROM tasks WHERE completed = 1')
      return { success: true }
    }

    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid delete action' })
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
