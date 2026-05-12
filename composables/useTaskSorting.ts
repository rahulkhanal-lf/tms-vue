import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'
import { usePreferencesStore } from '~/stores/usePreferencesStore'

/**
 * Returns a reactive sorted + filtered task list
 * driven by both the task store and preferences store.
 */
export function useTaskSorting() {
  const taskStore  = useTaskStore()
  const prefStore  = usePreferencesStore()

  const { tasks }                          = storeToRefs(taskStore)
  const { sortBy, sortDirection, filterStatus, filterPriority } = storeToRefs(prefStore)

  const sortedFilteredTasks = computed(() => {
    let result = [...tasks.value]

    // Filter by status
    if (filterStatus.value === 'active')    result = result.filter(t => !t.completed)
    if (filterStatus.value === 'completed') result = result.filter(t => t.completed)

    // Filter by priority
    if (filterPriority.value !== 'all') {
      result = result.filter(t => t.priority === filterPriority.value)
    }

    // Sort
    const dir = sortDirection.value === 'asc' ? 1 : -1

    result.sort((a, b) => {
      if (sortBy.value === 'title') {
        return dir * a.title.localeCompare(b.title)
      }
      if (sortBy.value === 'status') {
        return dir * (Number(a.completed) - Number(b.completed))
      }
      // date (default)
      return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    return result
  })

  return { sortedFilteredTasks }
}
