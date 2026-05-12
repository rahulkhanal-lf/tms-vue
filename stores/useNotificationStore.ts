import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: number
  type: NotificationType
  message: string
  duration: number
  dismissible: boolean
}

export interface NotifyOptions {
  duration?: number
  dismissible?: boolean
}

export const useNotificationStore = defineStore('notifications', () => {
  // ── State ──────────────────────────────────────────────────
  const notifications = ref<Notification[]>([])
  const maxVisible    = ref(3)
  let   nextId        = 1

  // ── Actions ────────────────────────────────────────────────
  function notify(
    type: NotificationType,
    message: string,
    options: NotifyOptions = {}
  ) {
    const duration    = options.duration    ?? 3000
    const dismissible = options.dismissible ?? true

    // Evict oldest if at capacity
    if (notifications.value.length >= maxVisible.value) {
      notifications.value.shift()
    }

    const id = nextId++
    notifications.value.push({ id, type, message, duration, dismissible })

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  function dismiss(id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  return { notifications, maxVisible, notify, dismiss, clearAll }
})
