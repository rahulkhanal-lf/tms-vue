/**
 * Pinia persistence plugin — SSR-safe, browser-only.
 * Persists: useTaskStore (tasks array only) + usePreferencesStore (full state).
 * Never persists: useNotificationStore.
 */
import { watch } from 'vue'
import { useTaskStore } from '~/stores/useTaskStore'
import { usePreferencesStore } from '~/stores/usePreferencesStore'

const TASK_KEY  = 'task-dashboard:tasks'
const PREF_KEY  = 'task-dashboard:preferences'

// Debounce helper — prevents excessive writes on rapid toggles
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

export default defineNuxtPlugin(() => {
  const taskStore = useTaskStore()
  const prefStore = usePreferencesStore()

  // ── Hydrate tasks ────────────────────────────────────────
  try {
    const raw = localStorage.getItem(TASK_KEY)
    if (raw) {
      taskStore.hydrateTasks(JSON.parse(raw))
    }
  } catch {
    localStorage.removeItem(TASK_KEY)
  }

  // ── Hydrate preferences ──────────────────────────────────
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved.theme)          prefStore.theme          = saved.theme
      if (saved.sortBy)         prefStore.sortBy         = saved.sortBy
      if (saved.sortDirection)  prefStore.sortDirection  = saved.sortDirection
      if (saved.filterStatus)   prefStore.filterStatus   = saved.filterStatus
      if (saved.filterPriority) prefStore.filterPriority = saved.filterPriority
      if (typeof saved.sidebarCollapsed === 'boolean') {
        prefStore.sidebarCollapsed = saved.sidebarCollapsed
      }
    }
  } catch {
    localStorage.removeItem(PREF_KEY)
  }

  // ── Persist tasks (debounced — max once per second) ──────
  const saveTasks = debounce(() => {
    localStorage.setItem(TASK_KEY, JSON.stringify(taskStore.tasks))
  }, 1000)

  watch(() => taskStore.tasks, saveTasks, { deep: true })

  // ── Persist preferences (immediate) ─────────────────────
  watch(
    () => ({
      theme:            prefStore.theme,
      sortBy:           prefStore.sortBy,
      sortDirection:    prefStore.sortDirection,
      filterStatus:     prefStore.filterStatus,
      filterPriority:   prefStore.filterPriority,
      sidebarCollapsed: prefStore.sidebarCollapsed
    }),
    (val) => localStorage.setItem(PREF_KEY, JSON.stringify(val)),
    { deep: true }
  )
})
