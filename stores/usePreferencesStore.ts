import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme          = 'light' | 'dark' | 'system'
export type SortBy         = 'date' | 'title' | 'status'
export type SortDirection  = 'asc' | 'desc'
export type FilterStatus   = 'all' | 'active' | 'completed'

export const usePreferencesStore = defineStore('preferences', () => {
  // ── State ──────────────────────────────────────────────────
  const theme            = ref<Theme>('system')
  const sortBy           = ref<SortBy>('date')
  const sortDirection    = ref<SortDirection>('desc')
  const filterStatus     = ref<FilterStatus>('all')
  const filterPriority   = ref<'all' | 'high' | 'medium' | 'low'>('all')
  const sidebarCollapsed = ref(false)

  // ── Getters ────────────────────────────────────────────────
  const isDarkMode = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    // system — check media query (only in browser)
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const activeSortLabel = computed(() => {
    const arrow = sortDirection.value === 'asc' ? '↑' : '↓'
    const labels: Record<SortBy, string> = {
      date: 'Date',
      title: 'Title',
      status: 'Status'
    }
    return `${labels[sortBy.value]} ${arrow}`
  })

  // ── Actions ────────────────────────────────────────────────
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    if (import.meta.client) {
      const html = document.documentElement
      html.classList.remove('dark', 'light')
      if (newTheme === 'dark') {
        html.classList.add('dark')
      } else if (newTheme === 'light') {
        // light is default — no class needed
      } else {
        // system
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          html.classList.add('dark')
        }
      }
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSortBy(field: SortBy, direction: SortDirection = 'desc') {
    sortBy.value = field
    sortDirection.value = direction
  }

  function setFilter(status: FilterStatus) {
    filterStatus.value = status
  }

  function setPriorityFilter(priority: 'all' | 'high' | 'medium' | 'low') {
    filterPriority.value = priority
  }

  function resetDefaults() {
    theme.value          = 'system'
    sortBy.value         = 'date'
    sortDirection.value  = 'desc'
    filterStatus.value   = 'all'
    filterPriority.value = 'all'
    sidebarCollapsed.value = false
  }

  return {
    // state
    theme, sortBy, sortDirection, filterStatus, filterPriority, sidebarCollapsed,
    // getters
    isDarkMode, activeSortLabel,
    // actions
    setTheme, toggleSidebar, setSortBy, setFilter, setPriorityFilter, resetDefaults
  }
})
