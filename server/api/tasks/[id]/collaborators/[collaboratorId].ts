import { createError } from 'h3'
import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const pool = getDbPool()
  const method = event.req.method
  const id = Number(event.context.params?.id)
  const collaboratorId = Number(event.context.params?.collaboratorId)
  const user = event.context.user as { id: number }

  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(collaboratorId) || collaboratorId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task or collaborator id' })
  }

  if (method !== 'DELETE') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
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
    throw createError({ statusCode: 403, statusMessage: 'Only task owner can remove collaborators' })
  }

  // Delete collaborator
  await pool.execute(
    'DELETE FROM task_collaborators WHERE task_id = ? AND user_id = ?',
    [id, collaboratorId]
  )

  return { success: true }
})