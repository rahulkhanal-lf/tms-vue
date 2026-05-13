import { createError, readBody } from 'h3'
import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const pool = getDbPool()
  const method = event.req.method
  const id = Number(event.context.params?.id)
  const user = event.context.user as { id: number }

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task id' })
  }

  // Check if user is task owner
  const [taskCheck] = await pool.query(
    'SELECT id, user_id FROM tasks WHERE id = ?',
    [id]
  )

  if (!Array.isArray(taskCheck) || taskCheck.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const task = taskCheck[0] as any
  if (task.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Only task owner can manage collaborators' })
  }

  if (method === 'GET') {
    const [collaborators] = await pool.query(
      `SELECT u.id, u.email
       FROM users u
       INNER JOIN task_collaborators tc ON u.id = tc.user_id
       WHERE tc.task_id = ?`,
      [id]
    )
    return collaborators
  }

  if (method === 'POST') {
    const body = await readBody(event) as { email?: string }
    if (!body.email) {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    // Find user by email
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [body.email])
    if (!Array.isArray(users) || users.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const collaboratorId = (users[0] as any).id

    // Prevent adding owner as collaborator
    if (collaboratorId === user.id) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot add yourself as collaborator' })
    }

    try {
      await pool.execute(
        'INSERT INTO task_collaborators (task_id, user_id) VALUES (?, ?)',
        [id, collaboratorId]
      )
      return { success: true, userId: collaboratorId, email: body.email }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw createError({ statusCode: 409, statusMessage: 'User is already a collaborator' })
      }
      throw error
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})