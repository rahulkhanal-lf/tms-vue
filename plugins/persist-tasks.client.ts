// .client.ts ensures this only runs in the browser (not SSR)
import { watch } from 'vue'
import { useTasks } from '~/composables/useTasks'

export default defineNuxtPlugin(() => {
  const { tasks, hydrateTasks } = useTasks()

  const STORAGE_KEY = 'task-dashboard:tasks'

  // Hydrate from localStorage on startup
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      hydrateTasks(
        parsed.map((t: { id: number; title: string; completed: boolean; createdAt: string }) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }))
      )
    }
  } catch {
    // Corrupted storage — start fresh
    localStorage.removeItem(STORAGE_KEY)
  }

  // Persist on every change
  watch(
    tasks,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )
})
