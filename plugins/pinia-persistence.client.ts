/**
 * Pinia persistence plugin — SSR-safe, browser-only.
 * Persists only user preferences in localStorage.
 */
import { watch } from 'vue'
import { usePreferencesStore } from '~/stores/usePreferencesStore'

const PREF_KEY = 'task-dashboard:preferences'

export default defineNuxtPlugin(() => {
  const prefStore = usePreferencesStore()

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
