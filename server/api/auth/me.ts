export default defineEventHandler(async (event) => {
  // This endpoint is protected by auth middleware, so user should be available
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return user
})