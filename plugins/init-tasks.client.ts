import { useTaskStore } from '~/stores/useTaskStore'

export default defineNuxtPlugin((nuxtApp) => {
  const taskStore = useTaskStore()

  nuxtApp.hook('app:mounted', async () => {
    if (taskStore.isEmpty) {
      await taskStore.fetchTasks().catch(() => {
        // Errors are handled inside the store.
      })
    }
  })
})
