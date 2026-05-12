import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'
import { useNotificationStore } from '~/stores/useNotificationStore'

/**
 * Derived stats combining multiple task store getters.
 * Also watches for 100% completion and fires a special notification.
 */
export function useTaskStats() {
  const taskStore = useTaskStore()
  const notifStore = useNotificationStore()

  const { completedCount, pendingCount, completionPercentage, isEmpty, tasks } = storeToRefs(taskStore)

  const hasAnyTasks = computed(() => !isEmpty.value)

  const completionLabel = computed(() => {
    if (isEmpty.value) return 'No tasks yet'
    if (completionPercentage.value === 100) return '🎉 All done!'
    if (completionPercentage.value >= 75) return 'Almost there!'
    if (completionPercentage.value >= 50) return 'Halfway there!'
    return 'Keep going!'
  })

  // Cross-store: watch for 100% completion
  let prevPercentage = completionPercentage.value
  watch(completionPercentage, (newVal) => {
    if (newVal === 100 && prevPercentage < 100 && tasks.value.length > 0) {
      notifStore.notify('success', '🎉 All tasks completed! Great work!', { duration: 5000 })
    }
    prevPercentage = newVal
  })

  return {
    completedCount,
    pendingCount,
    completionPercentage,
    isEmpty,
    hasAnyTasks,
    completionLabel
  }
}
