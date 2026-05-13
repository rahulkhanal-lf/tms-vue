// import { useTaskStore } from '~/stores/useTaskStore'
// import { useAuthStore } from '~/stores/useAuthStore'

// export default defineNuxtPlugin((nuxtApp) => {
//   const authStore = useAuthStore()
//   const taskStore = useTaskStore()

//   authStore.initializeAuth()

//   nuxtApp.hook('app:mounted', async () => {
//     if (authStore.isAuthenticated && taskStore.isEmpty) {
//       await taskStore.fetchTasks().catch(() => {
//         // Errors are handled inside the store.
//       })
//     }
//   })
// })
