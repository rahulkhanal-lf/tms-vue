export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Wait for auth initialization
  await authStore.initializeAuth()

  if (to.path === '/auth') {
    if (authStore.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth')
  }
})